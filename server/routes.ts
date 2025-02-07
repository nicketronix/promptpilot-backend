import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPromptSchema } from "@shared/schema";
import { analyzePrompt } from "./openai";

export function registerRoutes(app: Express): Server {
  // Prompt routes without auth
  app.post("/api/prompts", async (req, res) => {
    try {
      const result = insertPromptSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json(result.error);
        return;
      }

      const { originalText } = result.data;

      // Use OpenAI to analyze the prompt
      const analysis = await analyzePrompt(originalText);

      // Store without user association
      const prompt = await storage.createPrompt(
        1, // default user id
        originalText,
        analysis.enhancedText,
        analysis.qualityScore
      );

      res.json({
        ...prompt,
        suggestions: analysis.suggestions,
      });
    } catch (error) {
      console.error("Error analyzing prompt:", error);
      res.status(500).json({ message: "Failed to analyze prompt" });
    }
  });

  app.get("/api/prompts", async (_req, res) => {
    const prompts = await storage.getPrompts(1); // default user id
    res.json(prompts);
  });

  const httpServer = createServer(app);
  return httpServer;
}
