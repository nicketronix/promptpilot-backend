import { users, prompts, promptFeedback } from "@shared/schema";
import type { User, InsertUser, Prompt, PromptFeedback } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.SessionStore;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Prompt operations
  createPrompt(userId: number, originalText: string, enhancedText: string, score: number): Promise<Prompt>;
  getPrompts(userId: number): Promise<Prompt[]>;
  getPrompt(id: number): Promise<Prompt | undefined>;
  
  // Feedback operations
  createFeedback(promptId: number, userId: number, isHelpful: boolean, comment?: string): Promise<PromptFeedback>;
  getFeedback(promptId: number): Promise<PromptFeedback[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private prompts: Map<number, Prompt>;
  private feedback: Map<number, PromptFeedback>;
  sessionStore: session.SessionStore;
  private currentUserId: number;
  private currentPromptId: number;
  private currentFeedbackId: number;

  constructor() {
    this.users = new Map();
    this.prompts = new Map();
    this.feedback = new Map();
    this.currentUserId = 1;
    this.currentPromptId = 1;
    this.currentFeedbackId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPrompt(userId: number, originalText: string, enhancedText: string, score: number): Promise<Prompt> {
    const id = this.currentPromptId++;
    const prompt: Prompt = {
      id,
      userId,
      originalText,
      enhancedText,
      qualityScore: score,
      createdAt: new Date(),
    };
    this.prompts.set(id, prompt);
    return prompt;
  }

  async getPrompts(userId: number): Promise<Prompt[]> {
    return Array.from(this.prompts.values()).filter(
      (prompt) => prompt.userId === userId,
    );
  }

  async getPrompt(id: number): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async createFeedback(promptId: number, userId: number, isHelpful: boolean, comment?: string): Promise<PromptFeedback> {
    const id = this.currentFeedbackId++;
    const feedback: PromptFeedback = {
      id,
      promptId,
      userId,
      isHelpful,
      comment: comment || null,
    };
    this.feedback.set(id, feedback);
    return feedback;
  }

  async getFeedback(promptId: number): Promise<PromptFeedback[]> {
    return Array.from(this.feedback.values()).filter(
      (feedback) => feedback.promptId === promptId,
    );
  }
}

export const storage = new MemStorage();
