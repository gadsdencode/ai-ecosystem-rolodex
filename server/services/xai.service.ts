import OpenAI from "openai";

const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

const VALID_CATEGORIES = [
  "text-generation", "image-generation", "audio-generation", "video-generation",
  "data-analysis", "chatbot", "search-engine", "coding-assistant", "other"
] as const;

export interface SuggestionsResult {
  suggestions: string;
}

export interface CategorizeResult {
  category: string;
}

export interface TagsResult {
  tags: string[];
}

export async function generateSuggestions(toolName: string, toolDescription: string): Promise<SuggestionsResult> {
  const prompt = `
    Tool Name: ${toolName}
    Description: ${toolDescription}
    
    Provide 3 concise, practical suggestions for how to best use this AI tool effectively.
    Format as a simple comma-separated list.
  `;
  
  const response = await xai.chat.completions.create({
    model: "grok-2-1212",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150,
  });
  
  return { 
    suggestions: response.choices[0].message.content || "Try exploring the tool's features." 
  };
}

export async function categorizeDescription(description: string): Promise<CategorizeResult> {
  const categoriesString = VALID_CATEGORIES.join(", ");
  
  const prompt = `
    Description of an AI tool: "${description}"
    
    Based on this description, classify this tool into exactly one of the following categories: ${categoriesString}
    
    Respond with only the category name, nothing else.
  `;
  
  const response = await xai.chat.completions.create({
    model: "grok-2-1212",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 20,
    temperature: 0.1
  });
  
  const suggestedCategory = response.choices[0].message.content?.trim();
  
  if (suggestedCategory && VALID_CATEGORIES.includes(suggestedCategory as typeof VALID_CATEGORIES[number])) {
    return { category: suggestedCategory };
  }
  
  return { category: "text-generation" };
}

export async function generateTags(description: string): Promise<TagsResult> {
  const prompt = `
    Description of an AI tool: "${description}"
    
    Based on this description, suggest 3-5 relevant tags for this tool.
    Respond with only a JSON array of strings, nothing else.
    Example response: ["Tag1", "Tag2", "Tag3"]
  `;
  
  const response = await xai.chat.completions.create({
    model: "grok-2-1212",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 100
  });
  
  const content = response.choices[0].message.content || '{"tags":["AI","Tool"]}';
  
  try {
    const result = JSON.parse(content);
    if (Array.isArray(result) || Array.isArray(result.tags)) {
      const tags = Array.isArray(result) ? result : result.tags;
      return { tags: tags.slice(0, 5) };
    }
    return { tags: ["AI", "Tool"] };
  } catch (e) {
    console.error("Failed to parse tag suggestions:", e);
    return { tags: ["AI", "Tool"] };
  }
}
