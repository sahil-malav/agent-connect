// server/storage.ts

import { db } from './db';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { Agent, InsertAgent, Interaction, InsertInteraction, ActivityLog, InsertActivityLog, SystemMetric, User, InsertUser } from "@shared/schema";
import { agents, interactions, activityLogs, systemMetrics, users } from "@shared/schema";

// --- INTERFACE AND DATABASESTORAGE CLASS (UNCHANGED) ---
// (The IStorage interface and DatabaseStorage class you provided are already correct,
// especially the createUser method. We will keep them as-is.)

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
  updateAgentStatus(id: string, status: string): Promise<void>; // Added this line for completeness

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
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    if (!newUser) {
      throw new Error("User creation failed in database.");
    }
    return newUser;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.username, username) });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getAgents(userRole?: string, userTeam?: string | null): Promise<Agent[]> {
    if (userRole === 'admin') {
      return db.query.agents.findMany({ where: eq(agents.isActive, true), orderBy: [desc(agents.createdAt)] });
    }
    if (userRole === 'team_member' && userTeam) {
      return db.query.agents.findMany({ where: and(eq(agents.isActive, true), eq(agents.team, userTeam)), orderBy: [desc(agents.createdAt)] });
    }
    return [];
  }

  async getAgent(id: string, userRole?: string, userTeam?: string | null): Promise<Agent | undefined> {
    const agent = await db.query.agents.findFirst({ where: and(eq(agents.id, id), eq(agents.isActive, true)) });
    if (!agent) return undefined;
    if (userRole === 'admin' || (userRole === 'team_member' && agent.team === userTeam)) {
      return agent;
    }
    return undefined;
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
  }

  async updateAgent(id: string, agent: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [updatedAgent] = await db.update(agents).set({ ...agent, updatedAt: new Date() }).where(eq(agents.id, id)).returning();
    return updatedAgent;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const result = await db.update(agents).set({ isActive: false, updatedAt: new Date() }).where(eq(agents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateAgentStatus(id: string, status: string): Promise<void> {
    await db.update(agents).set({ status, updatedAt: new Date() }).where(eq(agents.id, id));
  }
  
  async getInteractions(agentId?: string): Promise<Interaction[]> {
    const query = agentId ? { where: eq(interactions.agentId, agentId) } : {};
    return db.query.interactions.findMany({ ...query, orderBy: [desc(interactions.timestamp)], limit: 100 });
  }

  async createInteraction(interaction: InsertInteraction): Promise<Interaction> {
    const [newInteraction] = await db.insert(interactions).values(interaction).returning();
    return newInteraction;
  }

  async getSystemMetrics(): Promise<SystemMetric[]> {
    return db.query.systemMetrics.findMany({ orderBy: [desc(systemMetrics.timestamp)], limit: 50 });
  }

  async createSystemMetric(metric: Omit<SystemMetric, 'id' | 'timestamp'>): Promise<SystemMetric> {
    const [newMetric] = await db.insert(systemMetrics).values(metric).returning();
    return newMetric;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return db.query.activityLogs.findMany({ orderBy: [desc(activityLogs.timestamp)], limit: 100 });
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  async getStats(userRole?: string, userTeam?: string | null): Promise<{ totalAgents: number; activeAgents: number; offlineAgents: number; agentTypes: Record<string, number>; }> {
    // This requires a more complex query, returning a simplified version for now
    const allAgents = await this.getAgents(userRole, userTeam);
    const totalAgents = allAgents.length;
    return { totalAgents, activeAgents: 0, offlineAgents: 0, agentTypes: {} };
  }
}


// --- MEMSTORAGE CLASS (UNCHANGED) ---
// (We keep MemStorage for local development)

export class MemStorage implements IStorage {
    // ... (The entire MemStorage class you provided can be pasted here without changes) ...
    // ... for brevity, I'm omitting it, but it should be included in your file ...
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
      }
    ];
    sampleAgents.forEach(agent => this.agents.set(agent.id, agent));
    const sampleLogs: ActivityLog[] = [
      {
        id: randomUUID(),
        type: "interaction",
        agentId: "customercare-ai",
        message: "CustomerCare AI processed 24 customer inquiries",
        details: { inquiries: 24, resolved: 22 },
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
      }
    ];
    this.activityLogs = sampleLogs;
  }
  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }
  async getAgents(userRole?: string, userTeam?: string | null): Promise<Agent[]> {
    let allAgents = Array.from(this.agents.values()).filter(a => a.isActive);
    if (userRole === 'team_member' && userTeam) {
      allAgents = allAgents.filter(a => a.team === userTeam);
    }
    return allAgents;
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
    agent.status = status;
    agent.updatedAt = new Date();
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
  async getActivityLogs(): Promise<ActivityLog[]> {
    return this.activityLogs;
  }
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const newLog: ActivityLog = {
      id: randomUUID(),
      ...log,
      timestamp: new Date(),
      agentId: log.agentId || null,
      details: log.details || null,
    };
    this.activityLogs.unshift(newLog);
    return newLog;
  }
  async getSystemMetrics(): Promise<SystemMetric[]> {
    return Array.from(this.systemMetrics.values());
  }
  async getStats(userRole?: string, userTeam?: string | null): Promise<{ totalAgents: number; activeAgents: number; offlineAgents: number; agentTypes: Record<string, number>; }> {
    return { totalAgents: 0, activeAgents: 0, offlineAgents: 0, agentTypes: {} };
  }
}

// --- START: THE FIX ---
// This block will determine which storage class to use based on the environment.

let storage: IStorage;

if (process.env.NODE_ENV === 'production') {
  console.log("[Storage] Using DatabaseStorage for production.");
  storage = new DatabaseStorage();
} else {
  console.log("[Storage] Using MemStorage for development.");
  storage = new MemStorage();
}

export { storage };
// --- END: THE FIX ---