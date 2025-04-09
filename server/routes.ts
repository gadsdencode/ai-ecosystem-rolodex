import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { aiToolFormSchema } from "@shared/schema";
import { SSOReadyClient } from 'ssoready';

import OpenAI from "openai";

// Create a server-side OpenAI client configured for xAI API
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

// Initialize SSOReady client
const ssoreadyOptions: any = {
  apiKey: process.env.SSOREADY_API_KEY
};

// Uncomment if needed - depends on SSOReady SDK version and what options it accepts
// If SSOReady API doesn't accept this parameter, leave it commented out
/* 
if (process.env.NODE_ENV === 'development') {
  // Only for development to ensure callbacks work correctly
  ssoreadyOptions.callbackUrl = 'http://localhost:5000/ssoready-callback';
}
*/

const ssoready = new SSOReadyClient(ssoreadyOptions); // Using server-side environment variable

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

  // SAML initiation endpoint (proxy for SSOReady)
  app.post('/api/saml/initiate', async (req, res) => {
    try {
      const { organizationExternalId, email } = req.body;
      
      if (!organizationExternalId) {
        return res.status(400).json({ error: 'Organization external ID is required' });
      }
      
      // Get the SAML redirect URL, passing the email hint if available
      const options: any = { organizationExternalId };
      if (email) {
        // If email is provided, include it as a login hint
        options.loginHint = email;
      }
      
      const { redirectUrl } = await ssoready.saml.getSamlRedirectUrl(options);
      
      if (!redirectUrl) {
        return res.status(500).json({ error: 'No redirect URL returned from SSOReady' });
      }
      
      res.json({ redirectUrl });
    } catch (error) {
      console.error('Error initiating SAML login:', error);
      res.status(500).json({ error: 'Failed to initiate SAML login' });
    }
  });

  // SSO callback handling - both server API POST endpoint and client-side GET redirect
  // API endpoint for POST requests (used by the client code)
  app.post('/api/ssoready-callback', async (req, res) => {
    try {
      const { samlAccessCode } = req.body;
      
      if (!samlAccessCode) {
        return res.status(400).json({ error: 'SAML access code is required' });
      }
      
      console.log('Attempting to redeem SAML access code:', samlAccessCode.substring(0, 10) + '...');
      
      try {
        const result = await ssoready.saml.redeemSamlAccessCode({
          samlAccessCode
        });
        
        console.log('SSOReady redemption result:', result);
        
        if (!result || !result.email || !result.organizationExternalId) {
          console.error('Invalid SAML response data:', result);
          return res.status(401).json({ error: 'Invalid SAML response: missing required fields' });
        }
        
        // In a real implementation, you would:
        // 1. Look up or create a user with this email
        // 2. Associate them with the organization
        // 3. Generate a JWT or session token
        
        // For this demo, we'll create a simple auth token
        const authToken = Buffer.from(`${result.email}:${Date.now()}`).toString('base64');
        
        // Return user information and token
        res.json({
          email: result.email,
          organizationExternalId: result.organizationExternalId,
          token: authToken
        });
      } catch (samlError: any) {
        console.error('SSOReady SAML redemption error:', samlError);
        // More specific error message based on the actual error
        return res.status(500).json({ 
          error: 'SAML redemption failed', 
          details: samlError.message || 'Unknown error from SSOReady'
        });
      }
    } catch (error: any) {
      console.error('Error processing SSO callback:', error);
      res.status(500).json({ error: 'Failed to process SSO callback', details: error.message });
    }
  });

  // Direct SSO callback from SSOReady (GET request from browser redirect)
  app.get('/api/ssoready-callback', async (req, res) => {
    console.log('Received direct SAML callback via GET request');
    // Log all query parameters
    console.log('Query parameters:', req.query);
    
    // Extract the SAML access code
    const samlAccessCode = req.query.saml_access_code || req.query.code;
    
    if (!samlAccessCode) {
      console.error('No SAML access code found in query parameters');
      // Render an error page or redirect to the login page
      return res.redirect('/login?error=missing_code');
    }
    
    try {
      // Handle the SAML callback directly on the server
      const result = await ssoready.saml.redeemSamlAccessCode({
        samlAccessCode: samlAccessCode.toString()
      });
      
      console.log('Successfully redeemed SAML code on server:', result);
      
      if (!result || !result.email || !result.organizationExternalId) {
        console.error('Invalid SAML response data:', result);
        return res.redirect('/login?error=invalid_response');
      }
      
      // Create auth token
      const authToken = Buffer.from(`${result.email}:${Date.now()}`).toString('base64');
      
      // Store authentication data in cookies or query parameters
      res.cookie('auth_token', authToken, { httpOnly: true });
      res.cookie('user_email', result.email);
      res.cookie('organization_id', result.organizationExternalId);
      
      // Redirect to the admin dashboard
      return res.redirect('/admin');
    } catch (error: any) {
      console.error('Error processing direct SAML callback:', error);
      return res.redirect(`/login?error=auth_failed&message=${encodeURIComponent(error.message || 'Unknown error')}`);
    }
  });

  // Add endpoint to resolve email domains to organization IDs
  app.post('/api/resolve-domain', async (req, res) => {
    try {
      const { email, domain } = req.body;
      
      if (!email || !domain) {
        return res.status(400).json({ error: 'Email and domain are required' });
      }
      
      // In a real implementation, you would look up the domain in your database
      // For this demo, we'll simply return the configured organization
      
      // Here you would typically:
      // 1. Look up the domain in your database to find matching organizations
      // 2. If multiple orgs match, use the email to find the specific one
      // 3. Return the organization ID
      
      // For this demo, we'll just return K01
      const organizationId = 'K01';
      
      res.json({ organizationId });
    } catch (error) {
      console.error('Error resolving domain:', error);
      res.status(500).json({ error: 'Failed to resolve domain to organization' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
