import type { Express } from "express";
import { createServer, type Server } from "http";

// Import controllers
import * as toolsController from "./controllers/tools.controller";
import * as authController from "./controllers/auth.controller";
import * as xaiController from "./controllers/xai.controller";

export async function registerRoutes(app: Express): Promise<Server> {
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
