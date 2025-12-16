import bcrypt from 'bcrypt';
import { storage } from '../storage';
import { generateToken, JWTPayload } from '../middleware/auth';

const SALT_ROUNDS = 10;

export interface LoginResult {
  success: boolean;
  token?: string;
  message?: string;
}

export interface RegisterResult {
  success: boolean;
  userId?: number;
  message?: string;
}

export async function loginUser(username: string, password: string): Promise<LoginResult> {
  try {
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return { success: false, message: 'Invalid username or password' };
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return { success: false, message: 'Invalid username or password' };
    }
    
    const token = generateToken({
      userId: user.id,
      username: user.username
    });
    
    return { success: true, token };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An error occurred during login' };
  }
}

export async function registerUser(username: string, password: string): Promise<RegisterResult> {
  try {
    const existingUser = await storage.getUserByUsername(username);
    
    if (existingUser) {
      return { success: false, message: 'Username already exists' };
    }
    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const user = await storage.createUser({
      username,
      password: hashedPassword
    });
    
    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'An error occurred during registration' };
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
