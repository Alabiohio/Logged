import { pgTable, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";

export const users = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull()
});

export const sessions = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => users.id)
});

export const accounts = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => users.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull()
});

export const verifications = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at")
});

export const userPreferences = pgTable("user_preferences", {
    userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
    emailNotifications: boolean("email_notifications").notNull().default(true),
    errorAlerts: boolean("error_alerts").notNull().default(true),
    weeklyDigest: boolean("weekly_digest").notNull().default(false),
    logRetentionDays: integer("log_retention_days").notNull().default(90),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const projects = pgTable("project", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    name: text("name").notNull(),
    description: text("description"),
    website: text("website"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const apiKeys = pgTable("api_key", {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    environment: text("environment").notNull(), // 'development', 'staging', 'production'
    key: text("key").notNull(),
    keyHash: text("key_hash").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => [
    index("api_key_project_idx").on(table.projectId),
    index("api_key_hash_idx").on(table.keyHash)
]);

export const logs = pgTable(
    "log",
    {
        id: text("id").primaryKey(),
        projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),

        level: text("level").notNull(),        // debug | info | success | warn | error
        message: text("message").notNull(),
        metadata: text("metadata"),            // JSON string

        environment: text("environment"),      // development | staging | production
        source: text("source"),               // server | client | edge

        url: text("url"),
        pathname: text("pathname"),
        userAgent: text("user_agent"),
        ipAddress: text("ip_address"),

        stack: text("stack"),

        timestamp: timestamp("timestamp"),     // client-supplied event time (optional)
        createdAt: timestamp("created_at").notNull().defaultNow()
    },
    (table) => [
        index("log_project_id_idx").on(table.projectId),
        index("log_created_at_idx").on(table.createdAt),
        index("log_level_idx").on(table.level),
        index("log_environment_idx").on(table.environment),
        index("log_project_created_idx").on(table.projectId, table.createdAt),
        index("log_project_level_idx").on(table.projectId, table.level),
        index("log_project_env_idx").on(table.projectId, table.environment),
    ]
);
