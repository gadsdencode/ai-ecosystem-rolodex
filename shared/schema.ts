import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// AI Tool Model
export const aiTools = pgTable("ai_tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().notNull(),
  notes: text("notes"),
  iconColor: text("icon_color").notNull().default("blue"),
  dateAdded: timestamp("date_added").notNull().defaultNow(),
  dateModified: timestamp("date_modified").notNull().defaultNow(),
});

export const categorySchema = z.enum([
  "text-generation",
  "image-generation",
  "code-assistant",
  "productivity",
  "research",
  "audio-generation",
  "video-generation",
  "other"
]);

export const colorSchema = z.enum([
  "blue",
  "purple",
  "green",
  "orange",
  "cyan"
]);

export const insertAiToolSchema = createInsertSchema(aiTools).omit({
  id: true,
  dateAdded: true,
  dateModified: true,
});

export const aiToolFormSchema = insertAiToolSchema.extend({
  // Accept both string and array for tags to support both form input and API submission
  tags: z.union([
    z.string().transform((val) => val.split(",").map(tag => tag.trim()).filter(Boolean)),
    z.array(z.string())
  ]),
  category: categorySchema,
  iconColor: colorSchema
});

export type CategoryType = z.infer<typeof categorySchema>;
export type ColorType = z.infer<typeof colorSchema>;
export type AiTool = typeof aiTools.$inferSelect;
export type InsertAiTool = z.infer<typeof insertAiToolSchema>;
export type AiToolFormData = z.infer<typeof aiToolFormSchema>;
