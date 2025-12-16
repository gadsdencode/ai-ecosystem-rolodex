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

const createPool = () => {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    max: 20,
    idleTimeoutMillis: 30000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected database error on client:', err);
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
      const isConnectionError = 
        error.code === '57P01' ||
        error.code === '08006' ||
        error.code === '08003' ||
        error.code === '08001' ||
        error.message?.includes('connection terminated');
      
      if (isConnectionError && retries < maxRetries - 1) {
        retries++;
        const delay = calculateBackoff(retries, initialDelay);
        console.log(`Database connection error. Retry ${retries}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (pool.totalCount === 0 || pool.idleCount === 0) {
          console.log('Refreshing connection pool...');
          try {
            await pool.end();
          } catch (endError) {
            console.warn('Error ending pool:', endError);
          }
          Object.assign(pool, createPool());
        }
        continue;
      }
      
      if (retries >= maxRetries - 1) {
        console.error(`Database operation failed after ${maxRetries} attempts`);
      }
      
      throw error;
    }
  }
  
  throw new Error('Database operation failed: max retries exceeded');
}
