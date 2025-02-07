import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface PromptAnalysis {
  suggestions: string[];
  enhancedText: string;
  qualityScore: number;
}

export async function analyzePrompt(originalText: string): Promise<PromptAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `PromptEnhancer v1.0:
You are a master prompt engineer. Your task is to analyze and improve any given prompt by identifying areas where clarity, context, or detail are lacking. Then, rewrite the prompt so that it is more precise, engaging, and effective while still preserving the original intent.

Guidelines:
- Retain the core idea and purpose of the original prompt.
- Replace vague or ambiguous language with clear, actionable instructions.
- Add any missing context, examples, or background information that can guide the intended outcome.
- Organize the prompt logically, and if useful, break it into step-by-step instructions.
- Provide suggestions for improvement.

Please respond in JSON format with the following structure:
{
  "suggestions": ["list", "of", "improvement", "suggestions"],
  "enhancedText": "the improved prompt text",
  "qualityScore": number from 0-100 based on the original prompt's quality
}`,
        },
        {
          role: "user",
          content: originalText,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      suggestions: result.suggestions || [],
      enhancedText: result.enhancedText || originalText,
      qualityScore: Math.min(100, Math.max(0, result.qualityScore || 50)),
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to analyze prompt using AI");
  }
}
