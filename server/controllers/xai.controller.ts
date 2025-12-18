import { Request, Response } from "express";
import OpenAI from "openai";
import { log } from "../lib/logger";

// Create a server-side OpenAI client configured for xAI API
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

/**
 * POST /api/xai/suggestions - Generate usage suggestions for a tool
 */
export async function generateSuggestions(req: Request, res: Response) {
  try {
    const { toolName, toolDescription } = req.body;
    
    if (!toolName || !toolDescription) {
      return res.status(400).json({ error: 'Tool name and description are required' });
    }
    
    const prompt = `
      Tool Name: ${toolName}
      Description: ${toolDescription}
      
      Provide 3 concise, practical suggestions for how to best use this AI tool effectively.
      Format as a simple comma-separated list.
    `;
    
    const response = await xai.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });
    
    res.json({ suggestions: response.choices[0].message.content || "Try exploring the tool's features." });
  } catch (error) {
    log.error('Error generating suggestions', error as Error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
}

/**
 * POST /api/xai/categorize - Categorize a tool based on description
 */
export async function categorizeTool(req: Request, res: Response) {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    const validCategories = [
      "text-generation", "image-generation", "audio-generation", "video-generation",
      "data-analysis", "chatbot", "search-engine", "coding-assistant", "other"
    ];
    const categoriesString = validCategories.join(", ");
    
    const prompt = `
      Description of an AI tool: "${description}"
      
      Based on this description, classify this tool into exactly one of the following categories: ${categoriesString}
      
      Respond with only the category name, nothing else.
    `;
    
    const response = await xai.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 20,
      temperature: 0.1
    });
    
    const suggestedCategory = response.choices[0].message.content?.trim();
    
    if (suggestedCategory && validCategories.includes(suggestedCategory)) {
      res.json({ category: suggestedCategory });
    } else {
      res.json({ category: "text-generation" });
    }
  } catch (error) {
    log.error('Error categorizing tool', error as Error);
    res.status(500).json({ error: 'Failed to categorize tool' });
  }
}

/**
 * POST /api/xai/tags - Generate tags for a tool
 */
export async function generateTags(req: Request, res: Response) {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    const prompt = `
      Description of an AI tool: "${description}"
      
      Based on this description, suggest 3-5 relevant tags for this tool.
      Respond with only a JSON array of strings, nothing else.
      Example response: ["Tag1", "Tag2", "Tag3"]
    `;
    
    const response = await xai.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 100
    });
    
    const content = response.choices[0].message.content || '{"tags":["AI","Tool"]}';
    try {
      const result = JSON.parse(content);
      if (Array.isArray(result) || Array.isArray(result.tags)) {
        const tags = Array.isArray(result) ? result : result.tags;
        res.json({ tags: tags.slice(0, 5) });
      } else {
        res.json({ tags: ["AI", "Tool"] });
      }
    } catch (e) {
      log.warn("Failed to parse tag suggestions", e as Error);
      res.json({ tags: ["AI", "Tool"] });
    }
  } catch (error) {
    log.error('Error generating tags', error as Error);
    res.status(500).json({ error: 'Failed to generate tags' });
  }
}

