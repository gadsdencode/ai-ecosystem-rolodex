import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { aiToolFormSchema } from "@shared/schema";
import { isAuthenticated, optionalAuth } from "./middleware/auth";
import * as xaiService from "./services/xai.service";
import * as ssoService from "./services/sso.service";
import * as authService from "./services/auth.service";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const result = await authService.loginUser(username, password);
      
      if (!result.success) {
        return res.status(401).json({ message: result.message });
      }
      
      res.cookie('auth_token', result.token, { 
        httpOnly: false,
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
        sameSite: 'lax' 
      });
      
      res.json({ token: result.token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'An error occurred during login' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      
      const result = await authService.registerUser(username, password);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.status(201).json({ message: 'User registered successfully', userId: result.userId });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'An error occurred during registration' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.cookie('auth_token', '', { 
      httpOnly: false,
      maxAge: 0,
      path: '/',
      sameSite: 'lax' 
    });
    res.json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/verify', isAuthenticated, (req, res) => {
    res.json({ valid: true, user: req.user });
  });

  app.post('/api/xai/suggestions', isAuthenticated, async (req, res) => {
    try {
      const { toolName, toolDescription } = req.body;
      
      if (!toolName || !toolDescription) {
        return res.status(400).json({ error: 'Tool name and description are required' });
      }
      
      const result = await xaiService.generateSuggestions(toolName, toolDescription);
      res.json(result);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      res.status(500).json({ error: 'Failed to generate suggestions' });
    }
  });
  
  app.post('/api/xai/categorize', isAuthenticated, async (req, res) => {
    try {
      const { description } = req.body;
      
      if (!description) {
        return res.status(400).json({ error: 'Description is required' });
      }
      
      const result = await xaiService.categorizeDescription(description);
      res.json(result);
    } catch (error) {
      console.error('Error categorizing tool:', error);
      res.status(500).json({ error: 'Failed to categorize tool' });
    }
  });
  
  app.post('/api/xai/tags', isAuthenticated, async (req, res) => {
    try {
      const { description } = req.body;
      
      if (!description) {
        return res.status(400).json({ error: 'Description is required' });
      }
      
      const result = await xaiService.generateTags(description);
      res.json(result);
    } catch (error) {
      console.error('Error generating tags:', error);
      res.status(500).json({ error: 'Failed to generate tags' });
    }
  });

  app.get('/api/tools', async (req, res, next) => {
    try {
      const tools = await storage.getAllAiTools();
      res.json(tools);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/tools/:id', async (req, res, next) => {
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
  });

  app.post('/api/tools', isAuthenticated, async (req, res, next) => {
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
  });

  app.put('/api/tools/:id', isAuthenticated, async (req, res, next) => {
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
  });

  app.delete('/api/tools/:id', isAuthenticated, async (req, res, next) => {
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
  });

  app.post('/api/saml/initiate', async (req, res) => {
    try {
      const { organizationExternalId, email } = req.body;
      
      if (!organizationExternalId) {
        return res.status(400).json({ error: 'Organization external ID is required' });
      }
      
      const result = await ssoService.initiateSAMLLogin({
        organizationExternalId,
        loginHint: email
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error initiating SAML login:', error);
      res.status(500).json({ error: 'Failed to initiate SAML login' });
    }
  });

  app.post('/api/ssoready-callback', async (req, res) => {
    try {
      const { samlAccessCode } = req.body;
      
      if (!samlAccessCode) {
        return res.status(400).json({ error: 'SAML access code is required' });
      }
      
      const result = await ssoService.redeemSAMLAccessCode(samlAccessCode);
      
      res.cookie('auth_token', result.token, { 
        httpOnly: false,
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
        sameSite: 'lax' 
      });
      res.cookie('user_email', result.email, { 
        httpOnly: false, 
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
        sameSite: 'lax' 
      });
      res.cookie('organization_id', result.organizationExternalId, { 
        httpOnly: false, 
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
        sameSite: 'lax' 
      });

      console.log('Setting cookies:', {
        auth_token: result.token.substring(0, 10) + '...',
        user_email: result.email,
        organization_id: result.organizationExternalId
      });
      
      res.json({
        email: result.email,
        organizationExternalId: result.organizationExternalId,
        token: result.token
      });
    } catch (error: any) {
      console.error('Error processing SSO callback:', error);
      res.status(500).json({ error: 'Failed to process SSO callback', details: error.message });
    }
  });

  app.get('/api/ssoready-callback', async (req, res) => {
    console.log('Received direct SAML callback via GET request');
    console.log('Query parameters:', req.query);
    
    const samlAccessCode = req.query.saml_access_code || req.query.code;
    
    if (!samlAccessCode) {
      console.error('No SAML access code found in query parameters');
      return res.redirect('/login?error=missing_code');
    }
    
    try {
      const result = await ssoService.redeemSAMLAccessCode(samlAccessCode.toString());
      
      console.log('Successfully redeemed SAML code on server');
      
      res.cookie('auth_token', result.token, { 
        httpOnly: false,
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
        sameSite: 'lax' 
      });
      res.cookie('user_email', result.email, { 
        httpOnly: false, 
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
        sameSite: 'lax' 
      });
      res.cookie('organization_id', result.organizationExternalId, { 
        httpOnly: false, 
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
        sameSite: 'lax' 
      });

      console.log('Setting cookies:', {
        auth_token: result.token.substring(0, 10) + '...',
        user_email: result.email,
        organization_id: result.organizationExternalId
      });
      
      return res.redirect('/admin');
    } catch (error: any) {
      console.error('Error processing direct SAML callback:', error);
      return res.redirect(`/login?error=auth_failed&message=${encodeURIComponent(error.message || 'Unknown error')}`);
    }
  });

  app.post('/api/resolve-domain', async (req, res) => {
    try {
      const { email, domain } = req.body;
      
      if (!email || !domain) {
        return res.status(400).json({ error: 'Email and domain are required' });
      }
      
      const organizationId = await ssoService.resolveDomainToOrganization(email, domain);
      res.json({ organizationId });
    } catch (error) {
      console.error('Error resolving domain:', error);
      res.status(500).json({ error: 'Failed to resolve domain to organization' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
