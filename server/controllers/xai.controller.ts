import { Request, Response } from "express";
import * as xaiService from "../services/xai.service";

/**
 * POST /api/xai/suggestions - Generate usage suggestions for a tool
 */
export async function generateSuggestions(req: Request, res: Response) {
  const { toolName, toolDescription } = req.body;

  if (!toolName || !toolDescription) {
    return res.status(400).json({ error: "Tool name and description are required" });
  }

  const result = await xaiService.generateSuggestions(toolName, toolDescription);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json({ suggestions: result.suggestions });
}

/**
 * POST /api/xai/categorize - Categorize a tool based on description
 */
export async function categorizeTool(req: Request, res: Response) {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  const result = await xaiService.categorizeTool(description);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json({ category: result.category });
}

/**
 * POST /api/xai/tags - Generate tags for a tool
 */
export async function generateTags(req: Request, res: Response) {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  const result = await xaiService.generateTags(description);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json({ tags: result.tags });
}
