import { db } from './db';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { Agent, InsertAgent, Interaction, InsertInteraction, ActivityLog, InsertActivityLog, SystemMetric, User, InsertUser } from "@shared/schema";
import { agents, interactions, activityLogs, systemMetrics, users } from "@shared/schema";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Agent operations with RBAC
  getAgents(userRole?: string, userTeam?: string | null): Promise<Agent[]>;
  getAgent(id: string, userRole?: string, userTeam?: string | null): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;

  // Interaction operations
  getInteractions(agentId?: string): Promise<Interaction[]>;
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;

  // System metrics operations
  getSystemMetrics(): Promise<SystemMetric[]>;
  createSystemMetric(metric: Omit<SystemMetric, 'id' | 'timestamp'>): Promise<SystemMetric>;

  // Activity log operations
  getActivityLogs(): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Stats operations
  getStats(userRole?: string, userTeam?: string | null): Promise<{
    totalAgents: number;
    activeAgents: number;
    offlineAgents: number;
    agentTypes: Record<string, number>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Agent operations with RBAC
  async getAgents(userRole?: string, userTeam?: string | null): Promise<Agent[]> {
    console.log(`[Storage] Getting agents for role: ${userRole}, team: ${userTeam}`);
    
    // Admin users see all agents
    if (userRole === 'admin') {
      console.log(`[Storage] Admin access - returning all active agents`);
      const allAgents = await db.select().from(agents)
        .where(eq(agents.isActive, true))
        .orderBy(desc(agents.createdAt));
      console.log(`[Storage] Found ${allAgents.length} active agents total`);
      return allAgents;
    }
    
    // Team members only see their team's agents
    if (userRole === 'team_member' && userTeam) {
      console.log(`[Storage] Team member access - filtering by team: ${userTeam}`);
      const teamAgents = await db.select().from(agents)
        .where(and(eq(agents.isActive, true), eq(agents.team, userTeam)))
        .orderBy(desc(agents.createdAt));
      console.log(`[Storage] Found ${teamAgents.length} agents for team: ${userTeam}`);
      return teamAgents;
    }
    
    console.log(`[Storage] No role/team match - returning empty array`);
    return [];
  }

  async getAgent(id: string, userRole?: string, userTeam?: string | null): Promise<Agent | undefined> {
    // Admin users see all agents
    if (userRole === 'admin') {
      const [agent] = await db.select().from(agents)
        .where(and(eq(agents.id, id), eq(agents.isActive, true)))
        .limit(1);
      return agent;
    }
    
    // Team members only see their team's agents
    if (userRole === 'team_member' && userTeam) {
      const [agent] = await db.select().from(agents)
        .where(and(
          eq(agents.id, id), 
          eq(agents.isActive, true), 
          eq(agents.team, userTeam)
        ))
        .limit(1);
      return agent;
    }
    
    return undefined;
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
  }

  async updateAgent(id: string, agent: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [updatedAgent] = await db.update(agents)
      .set({ ...agent, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return updatedAgent;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const result = await db.update(agents)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(agents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateAgentStatus(id: string, status: string): Promise<void> {
    await db.update(agents)
      .set({ status, updatedAt: new Date() })
      .where(eq(agents.id, id));
  }

  // Interaction operations
  async getInteractions(agentId?: string): Promise<Interaction[]> {
    if (agentId) {
      return await db.select().from(interactions)
        .where(eq(interactions.agentId, agentId))
        .orderBy(desc(interactions.timestamp))
        .limit(100);
    }
    
    return await db.select().from(interactions)
      .orderBy(desc(interactions.timestamp))
      .limit(100);
  }

  async createInteraction(interaction: InsertInteraction): Promise<Interaction> {
    const [newInteraction] = await db.insert(interactions).values(interaction).returning();
    return newInteraction;
  }

  // System metrics operations
  async getSystemMetrics(): Promise<SystemMetric[]> {
    return await db.select().from(systemMetrics).orderBy(desc(systemMetrics.timestamp)).limit(50);
  }

  async createSystemMetric(metric: Omit<SystemMetric, 'id' | 'timestamp'>): Promise<SystemMetric> {
    const [newMetric] = await db.insert(systemMetrics).values(metric).returning();
    return newMetric;
  }

  // Activity log operations
  async getActivityLogs(): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.timestamp)).limit(100);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  // Stats operations with RBAC
  async getStats(userRole?: string, userTeam?: string | null): Promise<{
    totalAgents: number;
    activeAgents: number;
    offlineAgents: number;
    agentTypes: Record<string, number>;
  }> {
    let baseQuery = db.select().from(agents).where(eq(agents.isActive, true));
    
    // Apply role-based filtering
    if (userRole === 'team_member' && userTeam) {
      const allAgents = await db.select().from(agents).where(and(eq(agents.isActive, true), eq(agents.team, userTeam)));
      const totalAgents = allAgents.length;
      const activeAgents = allAgents.filter(a => a.status === 'active' || a.status === 'online' || a.status === 'busy').length;
      const offlineAgents = allAgents.filter(a => a.status === 'offline' || a.status === 'error').length;
      
      const agentTypes: Record<string, number> = {};
      allAgents.forEach(agent => {
        agentTypes[agent.agentType] = (agentTypes[agent.agentType] || 0) + 1;
      });
      
      return {
        totalAgents,
        activeAgents,
        offlineAgents,
        agentTypes,
      };
    }
    
    const allAgents = await baseQuery;
    
    const totalAgents = allAgents.length;
    const activeAgents = allAgents.filter(a => a.status === 'active' || a.status === 'online' || a.status === 'busy').length;
    const offlineAgents = allAgents.filter(a => a.status === 'offline' || a.status === 'error').length;
    
    const agentTypes: Record<string, number> = {};
    allAgents.forEach(agent => {
      agentTypes[agent.agentType] = (agentTypes[agent.agentType] || 0) + 1;
    });
    
    return {
      totalAgents,
      activeAgents,
      offlineAgents,
      agentTypes,
    };
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private agents: Map<string, Agent>;
  private interactions: Map<string, Interaction>;
  private activityLogs: ActivityLog[];
  private systemMetrics: Map<string, SystemMetric>;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.interactions = new Map();
    this.activityLogs = [];
    this.systemMetrics = new Map();
    
    // Initialize with sample data
    this.initializeSampleUsers();
    this.initializeSampleData();
  }

  private initializeSampleUsers() {
    // Pre-hashed passwords for sample users
    const sampleUsers: User[] = [
      {
        id: "admin-001",
        username: "admin",
        email: "admin@ust.com",
        passwordHash: "$2b$10$7h2V/Jp5DaTeXtKVZ0ut7OjbNxnfPoK8iy7YnssEgKKXJ4i0ZXpiq", // admin123
        firstName: "UST",
        lastName: "Administrator",
        role: "admin",
        team: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "team-001",
        username: "teamuser",
        email: "team@ust.com",
        passwordHash: "$2b$10$kZ2PP41yQ9uOvhijAMvWmuaJWeV1.losl93V5m7Fektnw18miloRu", // team123
        firstName: "Team",
        lastName: "Member",
        role: "team_member",
        team: "Development Team",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleUsers.forEach(user => this.users.set(user.id, user));
  }

  // User operations - placeholder implementations
  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: randomUUID(),
      ...user,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...user, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  private initializeSampleData() {
    // Sample agents
    const sampleAgents: Agent[] = [
      {
        id: "customercare-ai",
        name: "CustomerCare AI",
        team: "Customer Experience Team",
        description: "AI agent for handling customer service inquiries",
        techStack: "GPT-4 + Langchain",
        agentType: "Simple reflex agents",
        status: "online",
        containerUrl: "http://localhost:3001",
        dockerImage: "registry.ust.com/customercare-ai:v1.2.3",
        responseTime: "1.2s avg",
        uptime: "99.8%",
        lastHealthCheck: new Date(),
        capabilities: ["customer_support", "refund_processing", "order_tracking"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "datainsight-pro",
        name: "DataInsight Pro",
        team: "Analytics Team",
        description: "Advanced data analysis and insights generation",
        techStack: "Claude + Python",
        agentType: "Model-based agents",
        status: "online",
        containerUrl: "http://localhost:3002",
        dockerImage: "registry.ust.com/datainsight-pro:v2.1.0",
        responseTime: "2.8s avg",
        uptime: "97.5%",
        lastHealthCheck: new Date(),
        capabilities: ["data_analysis", "report_generation", "predictive_modeling"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "contentcraft-ai",
        name: "ContentCraft AI",
        team: "Marketing Team",
        description: "Creative content generation and marketing assistance",
        techStack: "GPT-3.5 + Custom",
        agentType: "Goal-based agents",
        status: "busy",
        containerUrl: "http://localhost:3003",
        dockerImage: "registry.ust.com/contentcraft-ai:v1.8.5",
        responseTime: "3.5s avg",
        uptime: "95.2%",
        lastHealthCheck: new Date(),
        capabilities: ["content_creation", "copywriting", "seo_optimization"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "autoflow-engine",
        name: "AutoFlow Engine",
        team: "Operations Team",
        description: "Process automation and workflow optimization",
        techStack: "Custom ML + APIs",
        agentType: "Utility-based agents",
        status: "offline",
        containerUrl: "http://localhost:3004",
        dockerImage: "registry.ust.com/autoflow-engine:v3.0.1",
        responseTime: "N/A",
        uptime: "89.1%",
        lastHealthCheck: new Date(Date.now() - 3600000), // 1 hour ago
        capabilities: ["workflow_automation", "process_optimization", "task_scheduling"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "financewise-ai",
        name: "FinanceWise AI",
        team: "Finance Team",
        description: "Financial analysis and reporting assistant",
        techStack: "Gemini + TensorFlow",
        agentType: "Learning agents",
        status: "online",
        containerUrl: "http://localhost:3005",
        dockerImage: "registry.ust.com/codegenius-ai:v4.2.7",
        responseTime: "4.1s avg",
        uptime: "98.7%",
        lastHealthCheck: new Date(),
        capabilities: ["financial_analysis", "budget_planning", "expense_tracking"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "hrhelper-pro",
        name: "HR Helper Pro",
        team: "Human Resources Team",
        description: "HR processes and employee assistance",
        techStack: "GPT-4 + RAG",
        agentType: "Hierarchical agents",
        status: "online",
        containerUrl: "http://localhost:3006",
        dockerImage: "registry.ust.com/chatbot-supreme:v2.9.4",
        responseTime: "1.8s avg",
        uptime: "99.2%",
        lastHealthCheck: new Date(),
        capabilities: ["hr_support", "policy_guidance", "employee_onboarding"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleAgents.forEach(agent => this.agents.set(agent.id, agent));

    // Sample activity logs
    const sampleLogs: ActivityLog[] = [
      {
        id: randomUUID(),
        type: "interaction",
        agentId: "customercare-ai",
        message: "CustomerCare AI processed 24 customer inquiries",
        details: { inquiries: 24, resolved: 22 },
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
      {
        id: randomUUID(),
        type: "agent_registered",
        agentId: "datainsight-pro",
        message: "New agent registered: DataInsight Pro v2.1",
        details: { version: "2.1", team: "Analytics Team" },
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        id: randomUUID(),
        type: "agent_status_change",
        agentId: "autoflow-engine",
        message: "AutoFlow Engine went offline due to timeout",
        details: { previousStatus: "online", newStatus: "offline", reason: "timeout" },
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      },
      {
        id: randomUUID(),
        type: "system_event",
        agentId: null,
        message: "System health check completed successfully",
        details: { registryStatus: "healthy", k8sStatus: "running", checks: 15 },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    ];

    this.activityLogs = sampleLogs;

    // Sample system metrics
    const sampleMetrics: SystemMetric[] = [
      {
        id: randomUUID(),
        metric: "docker_registry_uptime",
        value: "98%",
        timestamp: new Date(),
      },
      {
        id: randomUUID(),
        metric: "k8s_cluster_health",
        value: "94%",
        timestamp: new Date(),
      },
      {
        id: randomUUID(),
        metric: "avg_response_time",
        value: "2.1s",
        timestamp: new Date(),
      },
      {
        id: randomUUID(),
        metric: "api_success_rate",
        value: "97.8%",
        timestamp: new Date(),
      },
    ];

    sampleMetrics.forEach(metric => this.systemMetrics.set(metric.metric, metric));
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgents(userRole?: string, userTeam?: string | null): Promise<Agent[]> {
    let allAgents = Array.from(this.agents.values()).filter(a => a.isActive);
    
    // Apply role-based filtering
    if (userRole === 'team_member' && userTeam) {
      allAgents = allAgents.filter(a => a.team === userTeam);
    }
    
    return allAgents;
  }

  async getAgentsByType(type: string): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(agent => agent.agentType === type);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = randomUUID();
    const agent: Agent = {
      ...insertAgent,
      id,
      status: "offline",
      responseTime: "N/A",
      uptime: "0%",
      lastHealthCheck: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: insertAgent.description || null,
      dockerImage: insertAgent.dockerImage || null,
      containerUrl: insertAgent.containerUrl || null,
    };
    this.agents.set(id, agent);
    
    // Log the registration
    await this.createActivityLog({
      type: "agent_registered",
      agentId: id,
      message: `New agent registered: ${agent.name}`,
      details: { team: agent.team, techStack: agent.techStack },
    });
    
    return agent;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;

    const updatedAgent = { ...agent, ...updates, updatedAt: new Date() };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const agent = this.agents.get(id);
    if (!agent) return false;
    
    agent.isActive = false;
    agent.updatedAt = new Date();
    this.agents.set(id, agent);
    return true;
  }

  async updateAgentStatus(id: string, status: string): Promise<void> {
    const agent = this.agents.get(id);
    if (!agent) return;

    const previousStatus = agent.status;
    agent.status = status;
    agent.lastHealthCheck = new Date();
    agent.updatedAt = new Date();
    this.agents.set(id, agent);

    // Log status change
    await this.createActivityLog({
      type: "agent_status_change",
      agentId: id,
      message: `${agent.name} status changed from ${previousStatus} to ${status}`,
      details: { previousStatus, newStatus: status },
    });
  }

  // Remove duplicate - already exists below

  async getInteractionsByAgent(agentId: string): Promise<Interaction[]> {
    return Array.from(this.interactions.values())
      .filter(interaction => interaction.agentId === agentId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async getInteractionsBySession(sessionId: string): Promise<Interaction[]> {
    return Array.from(this.interactions.values())
      .filter(interaction => interaction.sessionId === sessionId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = randomUUID();
    const log: ActivityLog = {
      ...insertLog,
      id,
      timestamp: new Date(),
      details: insertLog.details || null,
      agentId: insertLog.agentId || null,
    };
    this.activityLogs.unshift(log);
    
    // Keep only the latest 100 logs
    if (this.activityLogs.length > 100) {
      this.activityLogs = this.activityLogs.slice(0, 100);
    }
    
    return log;
  }

  async getInteractions(agentId?: string): Promise<Interaction[]> {
    const allInteractions = Array.from(this.interactions.values());
    if (agentId) {
      return allInteractions.filter(i => i.agentId === agentId);
    }
    return allInteractions;
  }

  async createInteraction(insertInteraction: InsertInteraction): Promise<Interaction> {
    const id = randomUUID();
    const interaction: Interaction = {
      ...insertInteraction,
      id,
      timestamp: new Date(),
      responseTime: insertInteraction.responseTime || null,
      response: insertInteraction.response || null,
      success: insertInteraction.success !== undefined ? insertInteraction.success : true,
    };
    this.interactions.set(id, interaction);
    return interaction;
  }

  async createSystemMetric(metric: Omit<SystemMetric, 'id' | 'timestamp'>): Promise<SystemMetric> {
    const newMetric: SystemMetric = {
      id: randomUUID(),
      ...metric,
      timestamp: new Date(),
    };
    this.systemMetrics.set(newMetric.metric, newMetric);
    return newMetric;
  }

  async getRecentActivityLogs(limit: number = 20): Promise<ActivityLog[]> {
    return this.activityLogs.slice(0, limit);
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return this.activityLogs;
  }

  async getSystemMetrics(): Promise<SystemMetric[]> {
    return Array.from(this.systemMetrics.values());
  }

  async updateSystemMetric(metric: string, value: string): Promise<void> {
    const existing = this.systemMetrics.get(metric);
    if (existing) {
      existing.value = value;
      existing.timestamp = new Date();
    } else {
      this.systemMetrics.set(metric, {
        id: randomUUID(),
        metric,
        value,
        timestamp: new Date(),
      });
    }
  }

  async getStats(userRole?: string, userTeam?: string | null): Promise<{
    totalAgents: number;
    activeAgents: number;
    offlineAgents: number;
    agentTypes: Record<string, number>;
  }> {
    let allAgents = Array.from(this.agents.values()).filter(a => a.isActive);
    
    // Apply role-based filtering
    if (userRole === 'team_member' && userTeam) {
      allAgents = allAgents.filter(a => a.team === userTeam);
    }
    
    const totalAgents = allAgents.length;
    const activeAgents = allAgents.filter(a => a.status === 'active' || a.status === 'online' || a.status === 'busy').length;
    const offlineAgents = allAgents.filter(a => a.status === 'offline' || a.status === 'error').length;
    
    const agentTypes: Record<string, number> = {};
    allAgents.forEach(agent => {
      agentTypes[agent.agentType] = (agentTypes[agent.agentType] || 0) + 1;
    });
    
    return {
      totalAgents,
      activeAgents,
      offlineAgents,
      agentTypes,
    };
  }
}

export const storage = new MemStorage();
