import type { Express } from "express";
import { createServer, type Server } from "http";

// Import controllers
import * as toolsController from "./controllers/tools.controller";
import * as authController from "./controllers/auth.controller";
import * as xaiController from "./controllers/xai.controller";
import * as authService from "./services/auth.service";
import { isAuthenticated } from "./middleware/auth";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "./lib/jwt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Traditional login/register endpoints
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
      
      res.cookie(AUTH_COOKIE_NAME, result.token, AUTH_COOKIE_OPTIONS);
      res.json({ success: true });
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

  app.get('/api/auth/verify', isAuthenticated, (req, res) => {
    res.json({ valid: true, user: req.user });
  });

  // XAI API proxy endpoints
  app.post('/api/xai/suggestions', xaiController.generateSuggestions);
  app.post('/api/xai/categorize', xaiController.categorizeTool);
  app.post('/api/xai/tags', xaiController.generateTags);

  // AI Tools CRUD endpoints
  app.get('/api/tools', toolsController.getAll);
  app.get('/api/tools/:id', toolsController.getById);
  app.post('/api/tools', toolsController.create);
  app.put('/api/tools/:id', toolsController.update);
  app.delete('/api/tools/:id', toolsController.remove);

  // Auth endpoints
  app.post('/api/saml/initiate', authController.initiateSaml);
  app.post('/api/ssoready-callback', authController.handleSsoCallbackPost);
  app.get('/api/ssoready-callback', authController.handleSsoCallbackGet);
  app.get('/api/auth/me', authController.getCurrentUser);
  app.post('/api/auth/logout', authController.logout);
  app.post('/api/resolve-domain', authController.resolveDomain);

  const httpServer = createServer(app);

  return httpServer;
}
