import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
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

      log(logLine);
    }
  });

  next();
});

// Add graceful restart capability
let serverInstance: any = null;
let restartAttempts = 0;
const MAX_RESTART_ATTEMPTS = 3;

const startServer = async (): Promise<void> => {
  try {
    // Initialize database and seed data if needed
    await storage.seedInitialData();
    log("Database initialized with seed data if needed");
    
    const server = await registerRoutes(app);
    serverInstance = server;

    // Global error handler - improved with specific error types
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      console.error("Error occurred:", err);
      
      // Don't expose stack traces in production
      const isProduction = process.env.NODE_ENV === 'production';
      
      // Database connection errors
      if (
        err.code === '57P01' || // terminating connection due to administrator command
        err.code === '08006' || // connection terminated
        err.code === '08003' || // connection does not exist
        err.code === '08001' || // connection exception
        (err.message && err.message.includes('connection terminated'))
      ) {
        console.error("Database connection error:", err);
        return res.status(503).json({ 
          message: "Database connection error. Please try again in a moment.",
          error: isProduction ? undefined : err.message,
          code: err.code
        });
      }
      
      // Handle validation errors - usually 400
      if (err.name === 'ValidationError' || err.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid input data", 
          error: isProduction ? undefined : err.message,
          details: err.details || err.errors
        });
      }
      
      // Handle not found errors - 404
      if (err.name === 'NotFoundError') {
        return res.status(404).json({ 
          message: err.message || "Resource not found",
          error: isProduction ? undefined : err.message
        });
      }
      
      // Handle unauthorized - 401
      if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ 
          message: "Authentication required",
          error: isProduction ? undefined : err.message
        });
      }
      
      // Handle forbidden - 403
      if (err.name === 'ForbiddenError') {
        return res.status(403).json({ 
          message: "Access denied",
          error: isProduction ? undefined : err.message
        });
      }
      
      // Default error handler
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ 
        message,
        error: isProduction ? undefined : err.message,
        code: err.code
      });
      
      // Don't throw here - it will crash the server
      // Instead, log the error and let the request complete
      if (status >= 500) {
        console.error("Unhandled server error:", err);
      }
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
      log(`serving on port ${port}`);
      // Reset restart attempts on successful server start
      restartAttempts = 0;
    });
  } catch (error) {
    console.error("Failed to initialize application:", error);
    // If we keep failing to start, don't keep trying indefinitely
    if (restartAttempts < MAX_RESTART_ATTEMPTS) {
      restartAttempts++;
      console.log(`Attempting server restart (${restartAttempts}/${MAX_RESTART_ATTEMPTS})...`);
      // Wait 10 seconds before restarting to allow resources to clean up
      setTimeout(startServer, 10000);
    } else {
      console.error(`Maximum restart attempts (${MAX_RESTART_ATTEMPTS}) reached. Exiting.`);
      process.exit(1);
    }
  }
};

// Start the server
startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
