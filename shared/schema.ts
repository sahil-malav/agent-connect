import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User management tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }),
  role: text("role").notNull().default("team_member"), // admin, team_member
  team: text("team"), // null for admin, specific team for team_member
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  team: text("team").notNull(),
  description: text("description"),
  techStack: text("tech_stack").notNull(),
  agentType: text("agent_type").notNull(),
  status: text("status").notNull().default("offline"), // online, offline, busy
  containerUrl: text("container_url"),
  dockerImage: text("docker_image"),
  responseTime: text("response_time"),
  uptime: text("uptime"),
  lastHealthCheck: timestamp("last_health_check"),
  capabilities: jsonb("capabilities"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const interactions = pgTable("interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").references(() => agents.id).notNull(),
  sessionId: varchar("session_id").notNull(),
  message: text("message").notNull(),
  response: text("response"),
  responseTime: integer("response_time"), // in milliseconds
  success: boolean("success").default(true),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metric: text("metric").notNull(), // docker_registry_uptime, k8s_cluster_health, avg_response_time, api_success_rate
  value: text("value").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // agent_registered, agent_status_change, interaction, system_event
  agentId: varchar("agent_id").references(() => agents.id),
  message: text("message").notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  interactions: many(interactions),
  activityLogs: many(activityLogs),
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
  agent: one(agents, {
    fields: [interactions.agentId],
    references: [agents.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  agent: one(agents, {
    fields: [activityLogs.agentId],
    references: [agents.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  passwordHash: true,
  firstName: true,
  lastName: true,
  role: true,
  team: true,
});

export const insertAgentSchema = createInsertSchema(agents).pick({
  name: true,
  team: true,
  description: true,
  techStack: true,
  agentType: true,
  status: true,
  containerUrl: true,
  dockerImage: true,
  capabilities: true,
});

export const insertInteractionSchema = createInsertSchema(interactions).pick({
  agentId: true,
  sessionId: true,
  message: true,
  response: true,
  responseTime: true,
  success: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  type: true,
  agentId: true,
  message: true,
  details: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type Interaction = typeof interactions.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
