import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  originalText: text("original_text").notNull(),
  enhancedText: text("enhanced_text").notNull(),
  qualityScore: integer("quality_score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const promptFeedback = pgTable("prompt_feedback", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id").notNull(),
  userId: integer("user_id").notNull(),
  isHelpful: boolean("is_helpful").notNull(),
  comment: text("comment"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPromptSchema = createInsertSchema(prompts).pick({
  originalText: true,
});

export const insertFeedbackSchema = createInsertSchema(promptFeedback).pick({
  promptId: true,
  isHelpful: true,
  comment: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Prompt = typeof prompts.$inferSelect;
export type PromptFeedback = typeof promptFeedback.$inferSelect;
