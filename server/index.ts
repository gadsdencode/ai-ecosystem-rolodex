import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log as viteLog } from "./vite";
import { storage } from "./storage";
import cookieParser from "cookie-parser";
import { xaiRateLimiter, apiRateLimiter, authRateLimiter } from "./middleware/rate-limit";
import { log } from "./lib/logger";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use((req, _res, next) => {
  log.http(`${req.method} ${req.path}`);
  next();
});
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      viteLog(logLine);
    }
  });

  next();
});

// Apply rate limiters
// Strict limit for XAI/AI endpoints (5 req/min)
app.use('/api/xai', xaiRateLimiter);
// Moderate limit for auth endpoints (10 req/min)
app.use('/api/auth', authRateLimiter);
app.use('/api/saml', authRateLimiter);
app.use('/api/ssoready-callback', authRateLimiter);
// General limit for all other API routes (100 req/min)
app.use('/api', apiRateLimiter);

// Add graceful restart capability
let serverInstance: any = null;
let restartAttempts = 0;
const MAX_RESTART_ATTEMPTS = 3;

const startServer = async (): Promise<void> => {
  try {
    // Initialize database and seed data if needed
    await storage.seedInitialData();
    log.info("Database initialized with seed data if needed");
    
    const server = await registerRoutes(app);
    serverInstance = server;

    // Global error handler - improved with specific error types
    // SECURITY: Never expose error.message or stack traces to clients
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      // Log full error details server-side only
      log.error("Error occurred", err);
      
      // Database connection errors - log and return generic message
      if (
        err.code === '57P01' || // terminating connection due to administrator command
        err.code === '08006' || // connection terminated
        err.code === '08003' || // connection does not exist
        err.code === '08001' || // connection exception
        (err.message && err.message.includes('connection terminated'))
      ) {
        log.error("Database connection error", err);
        return res.status(503).json({ 
          message: "Service temporarily unavailable. Please try again."
        });
      }
      
      // Handle validation errors - safe to show validation details
      if (err.name === 'ValidationError' || err.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid input data",
          errors: err.errors // Zod errors are safe - they describe input issues, not internal errors
        });
      }
      
      // Handle not found errors - 404
      if (err.name === 'NotFoundError') {
        return res.status(404).json({ 
          message: "Resource not found"
        });
      }
      
      // Handle unauthorized - 401
      if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ 
          message: "Authentication required"
        });
      }
      
      // Handle forbidden - 403
      if (err.name === 'ForbiddenError') {
        return res.status(403).json({ 
          message: "Access denied"
        });
      }
      
      // Default error handler - NEVER expose internal error details
      const status = err.status || err.statusCode || 500;
      
      // For 500+ errors, always return generic message
      if (status >= 500) {
        log.error("Unhandled server error", err);
        return res.status(500).json({ 
          message: "Internal Server Error"
        });
      }
      
      // For client errors (4xx), return generic message based on status
      const clientMessages: Record<number, string> = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        409: "Conflict",
        422: "Unprocessable Entity",
        429: "Too Many Requests"
      };
      
      res.status(status).json({ 
        message: clientMessages[status] || "Request Error"
      });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log.info(`Server started on port ${port}`);
      // Reset restart attempts on successful server start
      restartAttempts = 0;
    });
  } catch (error) {
    log.error("Failed to initialize application", error as Error);
    // If we keep failing to start, don't keep trying indefinitely
    if (restartAttempts < MAX_RESTART_ATTEMPTS) {
      restartAttempts++;
      log.warn(`Attempting server restart (${restartAttempts}/${MAX_RESTART_ATTEMPTS})...`);
      // Wait 10 seconds before restarting to allow resources to clean up
      setTimeout(startServer, 10000);
    } else {
      log.error(`Maximum restart attempts (${MAX_RESTART_ATTEMPTS}) reached. Exiting.`);
      process.exit(1);
    }
  }
};

// Start the server
startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM received, shutting down gracefully');
  if (serverInstance) {
    serverInstance.close(() => {
      log.info('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  log.info('SIGINT received, shutting down gracefully');
  if (serverInstance) {
    serverInstance.close(() => {
      log.info('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
