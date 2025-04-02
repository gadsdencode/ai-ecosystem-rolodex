import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { aiToolFormSchema } from "@shared/schema";

import OpenAI from "openai";

// Create a server-side OpenAI client configured for xAI API
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

export async function registerRoutes(app: Express): Promise<Server> {
  // XAI API proxy endpoints
  app.post('/api/xai/suggestions', async (req, res) => {
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
      console.error('Error generating suggestions:', error);
      res.status(500).json({ error: 'Failed to generate suggestions' });
    }
  });
  
  app.post('/api/xai/categorize', async (req, res) => {
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
      console.error('Error categorizing tool:', error);
      res.status(500).json({ error: 'Failed to categorize tool' });
    }
  });
  
  app.post('/api/xai/tags', async (req, res) => {
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
        console.error("Failed to parse tag suggestions:", e);
        res.json({ tags: ["AI", "Tool"] });
      }
    } catch (error) {
      console.error('Error generating tags:', error);
      res.status(500).json({ error: 'Failed to generate tags' });
    }
  });

  // GET all AI tools
  app.get('/api/tools', async (req, res) => {
    try {
      const tools = await storage.getAllAiTools();
      res.json(tools);
    } catch (error) {
      console.error('Error fetching AI tools:', error);
      res.status(500).json({ message: 'Failed to fetch AI tools' });
    }
  });

  // GET a single AI tool by ID
  app.get('/api/tools/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const tool = await storage.getAiTool(id);
      
      if (!tool) {
        return res.status(404).json({ message: 'AI tool not found' });
      }
      
      res.json(tool);
    } catch (error) {
      console.error('Error fetching AI tool:', error);
      res.status(500).json({ message: 'Failed to fetch AI tool' });
    }
  });

  // POST - Create a new AI tool
  app.post('/api/tools', async (req, res) => {
    try {
      const validatedData = aiToolFormSchema.parse(req.body);
      
      const newTool = await storage.createAiTool(validatedData);
      res.status(201).json(newTool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      console.error('Error creating AI tool:', error);
      res.status(500).json({ message: 'Failed to create AI tool' });
    }
  });

  // PUT - Update an existing AI tool
  app.put('/api/tools/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const validatedData = aiToolFormSchema.parse(req.body);
      
      const existingTool = await storage.getAiTool(id);
      
      if (!existingTool) {
        return res.status(404).json({ message: 'AI tool not found' });
      }
      
      const updatedTool = await storage.updateAiTool(id, validatedData);
      res.json(updatedTool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      console.error('Error updating AI tool:', error);
      res.status(500).json({ message: 'Failed to update AI tool' });
    }
  });

  // DELETE - Remove an AI tool
  app.delete('/api/tools/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const existingTool = await storage.getAiTool(id);
      
      if (!existingTool) {
        return res.status(404).json({ message: 'AI tool not found' });
      }
      
      await storage.deleteAiTool(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting AI tool:', error);
      res.status(500).json({ message: 'Failed to delete AI tool' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
