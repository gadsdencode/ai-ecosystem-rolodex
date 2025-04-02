import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { aiToolFormSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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
