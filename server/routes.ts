import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { hashPassword, verifyPassword, createSession, authenticateToken, logout, requireRole, requireTeamAccess, type AuthenticatedRequest } from "./auth";
import { insertAgentSchema, insertInteractionSchema, insertActivityLogSchema, insertUserSchema, loginSchema } from "@shared/schema";
import { randomUUID } from "crypto";

interface WebSocketConnection extends WebSocket {
  agentId?: string;
  sessionId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time agent communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active WebSocket connections
  const connections = new Map<string, WebSocketConnection>();
  
  wss.on('connection', (ws: WebSocketConnection, req) => {
    const sessionId = randomUUID();
    ws.sessionId = sessionId;
    connections.set(sessionId, ws);
    
    console.log(`WebSocket connection established: ${sessionId}`);
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('WebSocket received message:', message);
        
        switch (message.type) {
          case 'agent_connect':
            ws.agentId = message.agentId;
            console.log(`Agent connected: ${message.agentId} on session ${sessionId}`);
            ws.send(JSON.stringify({
              type: 'connection_established',
              agentId: message.agentId,
              sessionId
            }));
            break;
            
          case 'agent_message':
            console.log(`Processing message for agent ${ws.agentId}: ${message.content}`);
            if (ws.agentId && ws.sessionId) {
              const startTime = Date.now();
              
              // Simulate agent processing time
              setTimeout(async () => {
                const responseTime = Date.now() - startTime;
                const response = await simulateAgentResponse(ws.agentId!, message.content);
                console.log(`Agent response: ${response}`);
                
                try {
                  // Store interaction
                  await storage.createInteraction({
                    agentId: ws.agentId!,
                    sessionId: ws.sessionId!,
                    message: message.content,
                    response,
                    responseTime,
                    success: true,
                  });
                } catch (storageError) {
                  console.error('Storage error:', storageError);
                }
                
                const responseData = {
                  type: 'agent_response',
                  content: response,
                  responseTime,
                  timestamp: new Date().toISOString()
                };
                console.log('Sending response:', responseData);
                
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify(responseData));
                } else {
                  console.log('WebSocket not open, cannot send response');
                }
              }, Math.random() * 2000 + 500); // 0.5-2.5 second delay
            } else {
              console.log('No agent ID or session ID available for message');
            }
            break;
            
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process message'
          }));
        }
      }
    });
    
    ws.on('close', () => {
      if (ws.agentId) {
        // Note: updateAgentStatus method is now implemented
      }
      connections.delete(sessionId);
      console.log(`WebSocket connection closed: ${sessionId}`);
    });
  });
  
  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username) || 
                          await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password and create user
      const passwordHash = await hashPassword(userData.passwordHash);
      const user = await storage.createUser({
        ...userData,
        passwordHash,
      });
      
      // Create session
      const token = await createSession(user.id);
      
      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          team: user.team,
        },
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ error: 'Invalid user data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(credentials.username);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Verify password
      const isValid = await verifyPassword(credentials.password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Create session
      const token = await createSession(user.id);
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          team: user.team,
        },
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(400).json({ error: 'Invalid credentials' });
    }
  });

  app.post('/api/auth/logout', authenticateToken, logout);

  app.get('/api/auth/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
    res.json({ user: req.user });
  });

  // Agent management routes with RBAC
  app.get('/api/agents', authenticateToken, requireTeamAccess, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      console.log(`[RBAC] User ${user.username} (${user.role}) requesting agents. Team: ${user.team}`);
      
      const agents = await storage.getAgents(user.role, user.team);
      
      console.log(`[RBAC] Returning ${agents.length} agents for user ${user.username}`);
      if (agents.length > 0) {
        console.log(`[RBAC] Agent teams: ${agents.map(a => `${a.name}:${a.team}`).join(', ')}`);
      }
      
      res.json(agents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      res.status(500).json({ message: 'Failed to fetch agents' });
    }
  });
  
  app.get('/api/agents/:id', authenticateToken, requireTeamAccess, async (req: AuthenticatedRequest, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      res.json(agent);
    } catch (error) {
      console.error('Error fetching agent:', error);
      res.status(500).json({ message: 'Failed to fetch agent' });
    }
  });
  
  app.post('/api/agents', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const agentData = req.body;
      
      // Convert arrays to appropriate formats for storage
      if (Array.isArray(agentData.techStack)) {
        agentData.techStack = agentData.techStack.join(", ");
      }
      if (Array.isArray(agentData.capabilities)) {
        // Keep capabilities as array for JSON storage
        agentData.capabilities = agentData.capabilities;
      }
      
      const validatedData = insertAgentSchema.parse(agentData);
      const agent = await storage.createAgent(validatedData);
      
      // Log agent registration
      await storage.createActivityLog({
        type: 'agent_registered',
        agentId: agent.id,
        message: `New agent "${agent.name}" registered by ${agent.team}`,
        details: { 
          agentType: agent.agentType, 
          techStack: agent.techStack,
          capabilities: agent.capabilities 
        },
      });
      
      res.status(201).json(agent);
    } catch (error) {
      console.error('Error creating agent:', error);
      res.status(400).json({ message: 'Invalid agent data' });
    }
  });
  
  app.patch('/api/agents/:id/status', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const { status } = req.body;
      await storage.updateAgentStatus(req.params.id, status);
      res.json({ message: 'Agent status updated' });
    } catch (error) {
      console.error('Error updating agent status:', error);
      res.status(500).json({ message: 'Failed to update agent status' });
    }
  });

  // Container management routes
  app.post('/api/agents/:id/container/:action', async (req, res) => {
    try {
      const { id } = req.params;
      const { action } = req.params;
      
      // Simulate container operations
      await simulateContainerAction(id, action);
      
      // Update agent status based on action
      const newStatus = action === 'start' || action === 'deploy' ? 'online' : 
                       action === 'stop' ? 'offline' : 'busy';
      await storage.updateAgentStatus(id, newStatus);
      
      // Log the action
      await storage.createActivityLog({
        type: 'system_event',
        agentId: id,
        message: `Container ${action} completed for agent ${id}`,
        details: { action, timestamp: new Date().toISOString() },
      });
      
      res.json({ message: `Container ${action} completed` });
    } catch (error) {
      console.error(`Error performing container ${req.params.action}:`, error);
      res.status(500).json({ message: `Failed to ${req.params.action} container` });
    }
  });

  app.post('/api/agents/:id/scale', async (req, res) => {
    try {
      const { id } = req.params;
      const { replicas } = req.body;
      
      // Simulate Kubernetes scaling
      await simulateKubernetesScaling(id, replicas);
      
      // Log the scaling action
      await storage.createActivityLog({
        type: 'system_event',
        agentId: id,
        message: `Agent scaled to ${replicas} replicas`,
        details: { replicas, action: 'scale' },
      });
      
      res.json({ message: `Agent scaled to ${replicas} replicas` });
    } catch (error) {
      console.error('Error scaling agent:', error);
      res.status(500).json({ message: 'Failed to scale agent' });
    }
  });

  app.get('/api/agents/:id/metrics', async (req, res) => {
    try {
      const { id } = req.params;
      const metrics = await generateContainerMetrics(id);
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching container metrics:', error);
      res.status(500).json({ message: 'Failed to fetch container metrics' });
    }
  });
  
  // Activity logs
  app.get('/api/activity-logs', authenticateToken, requireTeamAccess, async (req: AuthenticatedRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({ message: 'Failed to fetch activity logs' });
    }
  });
  
  // System metrics
  app.get('/api/system-metrics', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const metrics = await storage.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      res.status(500).json({ message: 'Failed to fetch system metrics' });
    }
  });
  
  // Agent statistics
  app.get('/api/stats', authenticateToken, requireTeamAccess, async (req: AuthenticatedRequest, res) => {
    try {
      const stats = await storage.getStats(req.user!.role, req.user!.team);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });
  
  // Interaction history
  app.get('/api/agents/:id/interactions', authenticateToken, requireTeamAccess, async (req: AuthenticatedRequest, res) => {
    try {
      const interactions = await storage.getInteractions(req.params.id);
      res.json(interactions);
    } catch (error) {
      console.error('Error fetching interactions:', error);
      res.status(500).json({ message: 'Failed to fetch interactions' });
    }
  });
  
  // Cluster management routes
  app.post('/api/cluster/scale', async (req, res) => {
    try {
      const { action } = req.body;
      
      // Simulate cluster scaling
      await simulateClusterScaling(action);
      
      // Log the scaling action
      await storage.createActivityLog({
        type: 'system_event',
        message: `Kubernetes cluster ${action} operation completed`,
        details: { action, timestamp: new Date().toISOString() },
      });
      
      res.json({ message: `Cluster ${action} operation completed` });
    } catch (error) {
      console.error('Error scaling cluster:', error);
      res.status(500).json({ message: 'Failed to scale cluster' });
    }
  });

  app.get('/api/cluster/status', async (req, res) => {
    try {
      const status = await getClusterStatus();
      res.json(status);
    } catch (error) {
      console.error('Error fetching cluster status:', error);
      res.status(500).json({ message: 'Failed to fetch cluster status' });
    }
  });

  return httpServer;
}

// Container management utility functions
async function simulateContainerAction(agentId: string, action: string): Promise<void> {
  const delay = action === 'deploy' ? 3000 : action === 'restart' ? 2000 : 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  console.log(`Container ${action} completed for agent ${agentId}`);
}

async function simulateKubernetesScaling(agentId: string, replicas: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log(`Agent ${agentId} scaled to ${replicas} replicas`);
}

async function generateContainerMetrics(agentId: string): Promise<any> {
  const cpuUsage = (Math.random() * 80 + 10).toFixed(1) + '%';
  const memoryUsage = Math.floor(Math.random() * 400 + 100) + 'MB';
  const networkIO = (Math.random() * 50 + 5).toFixed(1) + 'KB/s';
  const diskIO = (Math.random() * 20 + 2).toFixed(1) + 'MB/s';
  const restartCount = Math.floor(Math.random() * 3);
  const uptimeHours = Math.floor(Math.random() * 168);
  const uptime = `${Math.floor(uptimeHours / 24)}d ${uptimeHours % 24}h`;
  
  return {
    cpuUsage,
    memoryUsage,
    networkIO,
    diskIO,
    restartCount,
    uptime
  };
}

// Agent response simulation for demo
async function simulateAgentResponse(agentId: string, userMessage: string): Promise<string> {
  // Get agent from storage to create contextual responses
  const agent = await storage.getAgent(agentId);
  if (!agent) {
    return "I'm sorry, I'm currently unavailable. Please try again later.";
  }

  const responses: Record<string, string[]> = {
    'Simple reflex agents': [
      "I respond directly to current inputs based on predefined condition-action rules.",
      "My responses are immediate and based on the current situation I perceive.",
      "I follow simple if-then rules to provide quick, reactive assistance.",
      "I can handle straightforward requests with immediate pattern-based responses.",
      "My behavior is determined by current input stimuli and predefined responses."
    ],
    'Model-based agents': [
      "I maintain an internal model of the world to make informed decisions.",
      "Based on my understanding of the current state and history, here's my analysis.",
      "I consider both current inputs and my internal state model to provide responses.",
      "My recommendations take into account the broader context and environmental factors.",
      "I use my world model to predict outcomes and suggest optimal actions."
    ],
    'Goal-based agents': [
      "I'm working towards achieving specific objectives in my response planning.",
      "Let me determine the best course of action to reach the desired goal.",
      "I'll analyze different action sequences to achieve the optimal outcome.",
      "My recommendations are designed to help you reach your specified objectives.",
      "I consider future consequences and goal achievement in my decision-making."
    ],
    'Utility-based agents': [
      "I'm evaluating multiple options to maximize overall utility and satisfaction.",
      "Based on utility calculations, here's the most beneficial approach.",
      "I consider trade-offs and preferences to recommend the highest-value solution.",
      "My analysis weighs different factors to optimize for the best overall outcome.",
      "I can help balance competing objectives to achieve maximum utility."
    ],
    'Learning agents': [
      "I continuously improve my performance based on experience and feedback.",
      "My responses adapt and evolve based on previous interactions and outcomes.",
      "I'm incorporating new knowledge to provide increasingly better assistance.",
      "Through machine learning, I can enhance my problem-solving capabilities.",
      "I learn from each interaction to improve future responses and recommendations."
    ],
    'Hierarchical agents': [
      "I coordinate multiple sub-agents and processes to handle complex tasks.",
      "My approach involves decomposing complex problems into manageable subtasks.",
      "I manage different levels of abstraction to provide comprehensive solutions.",
      "I coordinate between high-level planning and low-level execution tasks.",
      "My hierarchical structure allows for sophisticated multi-level problem solving."
    ]
  };

  const agentResponses = responses[agent.agentType] || [
    "I'm here to help you with your request.",
    "Thank you for your message. I'm processing your request.",
    "I understand what you need. Let me assist you with that.",
    "I'm working on this for you right now.",
    "I appreciate your patience while I handle your request."
  ];

  // Simple keyword-based response selection
  const lowerMessage = userMessage.toLowerCase();
  let selectedResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];

  if (lowerMessage.includes('refund') || lowerMessage.includes('return')) {
    selectedResponse = "I can definitely help you with your refund request. Let me process that for you right away.";
  } else if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('damaged')) {
    selectedResponse = "I understand there's an issue. I'm here to help resolve this for you as quickly as possible.";
  } else if (lowerMessage.includes('order') || lowerMessage.includes('purchase')) {
    selectedResponse = "I can look up your order details and help you with any questions about your purchase.";
  } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    selectedResponse = `Hello! I'm ${agent.name}, a ${agent.agentType} agent, and I'm here to help you today. What can I assist you with?`;
  }

  return selectedResponse;
}

// Cluster management utilities
async function simulateClusterScaling(action: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log(`Kubernetes cluster ${action} operation completed`);
}

async function getClusterStatus(): Promise<any> {
  return {
    nodes: {
      total: 4,
      ready: 4,
      workers: 3,
      masters: 1
    },
    resources: {
      totalCpu: 12,
      totalMemory: 32,
      usedCpu: 68,
      usedMemory: 45,
      usedStorage: 32
    },
    pods: {
      running: 18,
      pending: 0,
      failed: 0
    }
  };
}


