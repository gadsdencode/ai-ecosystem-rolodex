import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from "dotenv";

dotenv.config();

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure Neon connection with proper error handling
const createPool = () => {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000, // 10 seconds
    max: 20, // Increase from default to allow more connections
    idleTimeoutMillis: 30000, // Reduce idle timeout to release connections faster
  });

  // Handle connection errors
  pool.on('error', (err) => {
    console.error('Unexpected database error on client:', err);
    // Don't crash the server on connection errors
  });

  return pool;
};

export const pool = createPool();
export const db = drizzle({ client: pool, schema });

// Function to execute database queries with retries
export async function executeWithRetry<T>(
  operation: () => Promise<T>, 
  maxRetries = 3, 
  delay = 1000
): Promise<T> {
  let retries = 0;
  
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      // Check if the error is a connection termination error
      if (
        error.code === '57P01' || // terminating connection due to administrator command
        error.code === '08006' || // connection terminated
        error.code === '08003' || // connection does not exist
        error.code === '08001' || // connection exception
        error.message?.includes('connection terminated')
      ) {
        if (retries < maxRetries) {
          retries++;
          console.log(`Database connection error. Retrying ${retries}/${maxRetries} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          // On connection error, create a new pool for subsequent operations
          // This is crucial for serverless environments where connections can be terminated
          if (pool.totalCount === 0 || pool.idleCount === 0) {
            console.log('Refreshing connection pool...');
            // Re-initialize the pool
            try {
              await pool.end();
            } catch (endError) {
              // Ignore errors when ending the pool
            }
            // Create a new pool and update the export reference
            Object.assign(pool, createPool());
          }
          continue;
        }
      }
      
      // For other errors or if max retries reached, rethrow
      throw error;
    }
  }
}
