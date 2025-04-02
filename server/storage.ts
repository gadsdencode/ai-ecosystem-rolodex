import { users, type User, type InsertUser, AiTool, AiToolFormData } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private aiTools: Map<number, AiTool>;
  private userCurrentId: number;
  private aiToolCurrentId: number;

  constructor() {
    this.users = new Map();
    this.aiTools = new Map();
    this.userCurrentId = 1;
    this.aiToolCurrentId = 1;
    
    // Add seed data for AI tools
    this.seedAiTools();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // AI Tool methods
  async getAllAiTools(): Promise<AiTool[]> {
    return Array.from(this.aiTools.values());
  }
  
  async getAiTool(id: number): Promise<AiTool | undefined> {
    return this.aiTools.get(id);
  }
  
  async createAiTool(toolData: AiToolFormData): Promise<AiTool> {
    const id = this.aiToolCurrentId++;
    const now = new Date();
    
    const newTool: AiTool = {
      id,
      name: toolData.name,
      description: toolData.description,
      url: toolData.url,
      category: toolData.category,
      tags: toolData.tags,
      notes: toolData.notes,
      iconColor: toolData.iconColor,
      dateAdded: now,
      dateModified: now
    };
    
    this.aiTools.set(id, newTool);
    return newTool;
  }
  
  async updateAiTool(id: number, toolData: AiToolFormData): Promise<AiTool> {
    const existingTool = this.aiTools.get(id);
    
    if (!existingTool) {
      throw new Error(`AI tool with ID ${id} not found`);
    }
    
    const updatedTool: AiTool = {
      ...existingTool,
      name: toolData.name,
      description: toolData.description,
      url: toolData.url,
      category: toolData.category,
      tags: toolData.tags,
      notes: toolData.notes,
      iconColor: toolData.iconColor,
      dateModified: new Date()
    };
    
    this.aiTools.set(id, updatedTool);
    return updatedTool;
  }
  
  async deleteAiTool(id: number): Promise<void> {
    if (!this.aiTools.has(id)) {
      throw new Error(`AI tool with ID ${id} not found`);
    }
    
    this.aiTools.delete(id);
  }
  
  // Seed data for initial AI tools
  private seedAiTools() {
    const seedTools: AiToolFormData[] = [
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
    
    // Add seed tools to the map
    seedTools.forEach((toolData) => {
      const id = this.aiToolCurrentId++;
      const now = new Date();
      // Subtract a random number of days (0-30) to create varied dates
      const randomDays = Math.floor(Math.random() * 30);
      const dateAdded = new Date(now);
      dateAdded.setDate(dateAdded.getDate() - randomDays);
      
      const tool: AiTool = {
        id,
        name: toolData.name,
        description: toolData.description,
        url: toolData.url,
        category: toolData.category,
        tags: toolData.tags,
        notes: toolData.notes,
        iconColor: toolData.iconColor,
        dateAdded,
        dateModified: dateAdded
      };
      
      this.aiTools.set(id, tool);
    });
  }
}

export const storage = new MemStorage();
