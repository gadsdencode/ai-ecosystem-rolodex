import { users, type User, type InsertUser, aiTools, AiTool, AiToolFormData } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for all storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // AI Tool methods
  getAllAiTools(): Promise<AiTool[]>;
  getAiTool(id: number): Promise<AiTool | undefined>;
  createAiTool(tool: AiToolFormData): Promise<AiTool>;
  updateAiTool(id: number, tool: AiToolFormData): Promise<AiTool>;
  deleteAiTool(id: number): Promise<void>;
}

// Database implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // AI Tool methods
  async getAllAiTools(): Promise<AiTool[]> {
    return await db.select().from(aiTools);
  }
  
  async getAiTool(id: number): Promise<AiTool | undefined> {
    const [tool] = await db.select().from(aiTools).where(eq(aiTools.id, id));
    return tool;
  }
  
  async createAiTool(toolData: AiToolFormData): Promise<AiTool> {
    const now = new Date();
    
    const [tool] = await db.insert(aiTools).values({
      name: toolData.name,
      description: toolData.description,
      url: toolData.url,
      category: toolData.category,
      tags: toolData.tags,
      notes: toolData.notes ? toolData.notes : null,
      iconColor: toolData.iconColor,
      dateAdded: now,
      dateModified: now
    }).returning();
    
    return tool;
  }
  
  async updateAiTool(id: number, toolData: AiToolFormData): Promise<AiTool> {
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
        dateModified: new Date()
      })
      .where(eq(aiTools.id, id))
      .returning();
    
    return updatedTool;
  }
  
  async deleteAiTool(id: number): Promise<void> {
    const existingTool = await this.getAiTool(id);
    
    if (!existingTool) {
      throw new Error(`AI tool with ID ${id} not found`);
    }
    
    await db.delete(aiTools).where(eq(aiTools.id, id));
  }
  
  // Seed initial data if needed (will be moved to a separate migration script)
  async seedInitialData(): Promise<void> {
    const count = await db.select().from(aiTools);
    
    // Only seed if no data exists
    if (count.length === 0) {
      const seedTools = [
        {
          name: "ChatGPT",
          description: "Advanced AI chatbot for text generation and conversation.",
          url: "https://chat.openai.com",
          category: "text-generation",
          tags: ["Conversation", "Writing", "Research"],
          notes: "Great for brainstorming ideas and refining writing. Use with specific prompts for best results.",
          iconColor: "blue"
        },
        {
          name: "DALL-E 3",
          description: "AI image generator that creates detailed images from text descriptions.",
          url: "https://labs.openai.com",
          category: "image-generation",
          tags: ["Art", "Design", "Creative"],
          notes: "Works best with detailed, clear descriptions. Include art style for more targeted results.",
          iconColor: "purple"
        },
        {
          name: "GitHub Copilot",
          description: "AI pair programmer that helps write code faster with less work.",
          url: "https://github.com/features/copilot",
          category: "code-assistant",
          tags: ["Programming", "Coding", "Development"],
          notes: "Useful for boilerplate code and routine tasks. Still needs human review to ensure quality.",
          iconColor: "green"
        },
        {
          name: "Notion AI",
          description: "AI writing assistant integrated with Notion for better productivity.",
          url: "https://notion.so",
          category: "productivity",
          tags: ["Notes", "Writing", "Organization"],
          notes: "Great for summarizing content, drafting emails, and brainstorming ideas within Notion.",
          iconColor: "orange"
        },
        {
          name: "Elicit",
          description: "AI research assistant that helps find and understand scientific papers.",
          url: "https://elicit.org",
          category: "research",
          tags: ["Academic", "Literature", "Scientific"],
          notes: "Excellent for literature reviews and understanding papers in unfamiliar fields.",
          iconColor: "cyan"
        },
        {
          name: "Midjourney",
          description: "AI image generator that creates artistic visuals based on text prompts.",
          url: "https://midjourney.com",
          category: "image-generation",
          tags: ["Art", "Design", "Creative"],
          notes: "Particularly good for stylized and artistic images. Use v5 model for best results.",
          iconColor: "purple"
        },
        {
          name: "Grok",
          description: "Conversational AI from xAI that combines intelligence with humor.",
          url: "https://x.ai/grok",
          category: "text-generation",
          tags: ["Conversation", "Real-time", "Discussion"],
          notes: "More playful and witty than other conversational AI. Good for creative brainstorming.",
          iconColor: "blue"
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
          dateAdded: dateAdded,
          dateModified: dateAdded
        });
      }
    }
  }
}

// Export a singleton instance of the DatabaseStorage
export const storage = new DatabaseStorage();
