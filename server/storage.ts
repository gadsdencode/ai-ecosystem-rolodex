import { users, type User, type InsertUser, aiTools, AiTool, AiToolFormData } from "@shared/schema";
import { db, executeWithRetry } from "./db";
import { eq, count, ilike, or, and, SQL } from "drizzle-orm";
import * as bcrypt from 'bcrypt';

// Pagination and filtering options interface
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  search?: string;
  category?: string;
  provider?: string;
  developmentStatus?: string;
}

// Paginated result interface
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Interface for all storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // AI Tool methods
  getAllAiTools(options?: PaginationOptions): Promise<PaginatedResult<AiTool>>;
  getAiTool(id: number): Promise<AiTool | undefined>;
  createAiTool(tool: AiToolFormData): Promise<AiTool>;
  updateAiTool(id: number, tool: AiToolFormData): Promise<AiTool>;
  deleteAiTool(id: number): Promise<void>;
}

// Database implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return executeWithRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return executeWithRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return executeWithRetry(async () => {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    });
  }
  
  // AI Tool methods
  async getAllAiTools(options?: PaginationOptions): Promise<PaginatedResult<AiTool>> {
    return executeWithRetry(async () => {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      
      // Build dynamic WHERE conditions
      const conditions: SQL[] = [];
      
      // Search filter: check name, description, or notes
      if (options?.search && options.search.trim()) {
        const searchTerm = `%${options.search.trim()}%`;
        conditions.push(
          or(
            ilike(aiTools.name, searchTerm),
            ilike(aiTools.description, searchTerm),
            ilike(aiTools.notes, searchTerm)
          )!
        );
      }
      
      // Category filter
      if (options?.category && options.category !== 'all') {
        conditions.push(eq(aiTools.category, options.category));
      }
      
      // Provider filter
      if (options?.provider) {
        conditions.push(eq(aiTools.provider, options.provider));
      }
      
      // Development status filter
      if (options?.developmentStatus && options.developmentStatus !== 'all') {
        conditions.push(eq(aiTools.developmentStatus, options.developmentStatus));
      }
      
      // Combine conditions with AND
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      // Get total count with filters applied
      const countQuery = db.select({ count: count() }).from(aiTools);
      if (whereClause) {
        countQuery.where(whereClause);
      }
      const [countResult] = await countQuery;
      const total = countResult?.count ?? 0;
      
      // Get paginated and filtered data
      const dataQuery = db.select().from(aiTools);
      if (whereClause) {
        dataQuery.where(whereClause);
      }
      const data = await dataQuery.limit(limit).offset(offset);
      
      return {
        data,
        total,
        limit,
        offset
      };
    });
  }
  
  async getAiTool(id: number): Promise<AiTool | undefined> {
    return executeWithRetry(async () => {
      const [tool] = await db.select().from(aiTools).where(eq(aiTools.id, id));
      return tool;
    });
  }
  
  async createAiTool(toolData: AiToolFormData): Promise<AiTool> {
    return executeWithRetry(async () => {
      const now = new Date();
      
      const [tool] = await db.insert(aiTools).values({
        name: toolData.name,
        description: toolData.description,
        url: toolData.url,
        category: toolData.category,
        tags: toolData.tags,
        notes: toolData.notes ? toolData.notes : null,
        iconColor: toolData.iconColor,
        provider: toolData.provider,
        developmentStatus: toolData.developmentStatus || 'production',
        dateAdded: now,
        dateModified: now
      }).returning();
      
      return tool;
    });
  }
  
  async updateAiTool(id: number, toolData: AiToolFormData): Promise<AiTool> {
    return executeWithRetry(async () => {
      const existingTool = await this.getAiTool(id);
      
      if (!existingTool) {
        throw new Error(`AI tool with ID ${id} not found`);
      }
      
      const [updatedTool] = await db.update(aiTools)
        .set({
          name: toolData.name,
          description: toolData.description,
          url: toolData.url,
          category: toolData.category,
          tags: toolData.tags,
          notes: toolData.notes ? toolData.notes : null,
          iconColor: toolData.iconColor,
          provider: toolData.provider,
          developmentStatus: toolData.developmentStatus || existingTool.developmentStatus,
          dateModified: new Date()
        })
        .where(eq(aiTools.id, id))
        .returning();
      
      return updatedTool;
    });
  }
  
  async deleteAiTool(id: number): Promise<void> {
    return executeWithRetry(async () => {
      const existingTool = await this.getAiTool(id);
      
      if (!existingTool) {
        throw new Error(`AI tool with ID ${id} not found`);
      }
      
      await db.delete(aiTools).where(eq(aiTools.id, id));
    });
  }
  
  async seedInitialData(): Promise<void> {
    return executeWithRetry(async () => {
      const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin'));
      
      if (existingAdmin.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.insert(users).values({
          username: 'admin',
          password: hashedPassword,
          email: 'admin@local.dev'
        });
        console.log('Admin user created with username: admin, password: admin123');
      }
      
      const count = await db.select().from(aiTools);
      
      if (count.length === 0) {
        const seedTools = [
          {
            name: "ChatGPT",
            description: "Advanced AI chatbot for text generation and conversation.",
            url: "https://chat.openai.com",
            category: "text-generation",
            tags: ["Conversation", "Writing", "Research"],
            notes: "Great for brainstorming ideas and refining writing. Use with specific prompts for best results.",
            iconColor: "blue",
            provider: "third-party",
            developmentStatus: "production"
          },
          {
            name: "DALL-E 3",
            description: "AI image generator that creates detailed images from text descriptions.",
            url: "https://labs.openai.com",
            category: "image-generation",
            tags: ["Art", "Design", "Creative"],
            notes: "Works best with detailed, clear descriptions. Include art style for more targeted results.",
            iconColor: "purple",
            provider: "third-party",
            developmentStatus: "production"
          },
          {
            name: "GitHub Copilot",
            description: "AI pair programmer that helps write code faster with less work.",
            url: "https://github.com/features/copilot",
            category: "code-assistant",
            tags: ["Programming", "Coding", "Development"],
            notes: "Useful for boilerplate code and routine tasks. Still needs human review to ensure quality.",
            iconColor: "green",
            provider: "third-party",
            developmentStatus: "production"
          },
          {
            name: "Notion AI",
            description: "AI writing assistant integrated with Notion for better productivity.",
            url: "https://notion.so",
            category: "productivity",
            tags: ["Notes", "Writing", "Organization"],
            notes: "Great for summarizing content, drafting emails, and brainstorming ideas within Notion.",
            iconColor: "orange",
            provider: "third-party",
            developmentStatus: "production"
          },
          {
            name: "Elicit",
            description: "AI research assistant that helps find and understand scientific papers.",
            url: "https://elicit.org",
            category: "research",
            tags: ["Academic", "Literature", "Scientific"],
            notes: "Excellent for literature reviews and understanding papers in unfamiliar fields.",
            iconColor: "cyan",
            provider: "third-party",
            developmentStatus: "production"
          },
          {
            name: "Midjourney",
            description: "AI image generator that creates artistic visuals based on text prompts.",
            url: "https://midjourney.com",
            category: "image-generation",
            tags: ["Art", "Design", "Creative"],
            notes: "Particularly good for stylized and artistic images. Use v5 model for best results.",
            iconColor: "purple",
            provider: "third-party",
            developmentStatus: "production"
          },
          {
            name: "Grok",
            description: "Conversational AI from xAI that combines intelligence with humor.",
            url: "https://x.ai/grok",
            category: "text-generation",
            tags: ["Conversation", "Real-time", "Discussion"],
            notes: "More playful and witty than other conversational AI. Good for creative brainstorming.",
            iconColor: "blue",
            provider: "third-party",
            developmentStatus: "production"
          }
        ];
        
        for (const toolData of seedTools) {
          const now = new Date();
          // Subtract a random number of days (0-30) to create varied dates
          const randomDays = Math.floor(Math.random() * 30);
          const dateAdded = new Date(now);
          dateAdded.setDate(dateAdded.getDate() - randomDays);
          
          await db.insert(aiTools).values({
            name: toolData.name,
            description: toolData.description,
            url: toolData.url,
            category: toolData.category,
            tags: toolData.tags,
            notes: toolData.notes ? toolData.notes : null,
            iconColor: toolData.iconColor,
            provider: toolData.provider,
            developmentStatus: toolData.developmentStatus || 'production',
            dateAdded: dateAdded,
            dateModified: dateAdded
          });
        }
      }
    });
  }
}

// Export a singleton instance of the DatabaseStorage
export const storage = new DatabaseStorage();
