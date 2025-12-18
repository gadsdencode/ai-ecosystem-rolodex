import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from "dotenv";
import { log } from "./lib/logger";

dotenv.config();

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const createPool = () => {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    max: 20,
    idleTimeoutMillis: 30000,
  });

  pool.on('error', (err) => {
    log.error('Unexpected database error on client', err);
    // Don't crash the server on connection errors
  });

  return pool;
};

export const pool = createPool();
export const db = drizzle({ client: pool, schema });

const MAX_RETRIES = 5;
const INITIAL_DELAY = 1000;
const MAX_DELAY = 30000;
const BACKOFF_MULTIPLIER = 2;

function calculateBackoff(attempt: number, initialDelay: number): number {
  const delay = initialDelay * Math.pow(BACKOFF_MULTIPLIER, attempt);
  return Math.min(delay, MAX_DELAY);
}

export async function executeWithRetry<T>(
  operation: () => Promise<T>, 
  maxRetries = MAX_RETRIES, 
  initialDelay = INITIAL_DELAY
): Promise<T> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      // Check if the error is a connection termination error
      const isConnectionError = 
        error.code === '57P01' || // terminating connection due to administrator command
        error.code === '08006' || // connection terminated
        error.code === '08003' || // connection does not exist
        error.code === '08001' || // connection exception
        error.message?.includes('connection terminated');
      
      if (isConnectionError && retries < maxRetries - 1) {
        retries++;
        const delay = calculateBackoff(retries, initialDelay);
        log.warn(`Database connection error. Retry ${retries}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // On connection error, create a new pool for subsequent operations
        // This is crucial for serverless environments where connections can be terminated
        if (pool.totalCount === 0 || pool.idleCount === 0) {
          log.info('Refreshing connection pool...');
          try {
            await pool.end();
          } catch (endError) {
            log.warn('Error ending pool:', endError as Error);
          }
          // Create a new pool and update the export reference
          Object.assign(pool, createPool());
        }
        continue;
      }
      
      if (retries >= maxRetries - 1) {
        log.error(`Database operation failed after ${maxRetries} attempts`);
      }
      
      throw error;
    }
  }
  
  throw new Error('Database operation failed: max retries exceeded');
}
