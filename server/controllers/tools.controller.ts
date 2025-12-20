import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { aiToolFormSchema } from "@shared/schema";

/**
 * GET /api/tools - Get all AI tools with pagination and filtering
 */
export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    
    // Extract filter parameters
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const provider = req.query.provider as string | undefined;
    const developmentStatus = req.query.developmentStatus as string | undefined;
    
    // Validate pagination params
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Invalid limit. Must be between 1 and 100.' });
    }
    if (isNaN(offset) || offset < 0) {
      return res.status(400).json({ message: 'Invalid offset. Must be 0 or greater.' });
    }
    
    const result = await storage.getAllAiTools({ 
      limit, 
      offset, 
      search, 
      category, 
      provider, 
      developmentStatus 
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tools/:id - Get a single AI tool by ID
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
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
    next(error);
  }
}

/**
 * POST /api/tools - Create a new AI tool
 */
export async function create(req: Request, res: Response, next: NextFunction) {
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
    
    next(error);
  }
}

/**
 * PUT /api/tools/:id - Update an existing AI tool
 */
export async function update(req: Request, res: Response, next: NextFunction) {
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
    
    next(error);
  }
}

/**
 * DELETE /api/tools/:id - Remove an AI tool
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
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
    next(error);
  }
}

