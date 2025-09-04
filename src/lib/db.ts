// Simple in-memory database for storing user code creations
// This can be easily replaced with PostgreSQL later

interface UserTool {
  id: string;
  userId: string;
  title: string;
  html: string;
  css: string;
  js: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage - will be replaced with PostgreSQL in production
let userTools: UserTool[] = [];

// Helper function to convert Date objects to strings for API responses
const serializeTool = (tool: UserTool) => {
  return {
    ...tool,
    createdAt: tool.createdAt.toISOString(),
    updatedAt: tool.updatedAt.toISOString()
  };
};

export const db = {
  // Create a new tool
  async createTool(data: Omit<UserTool, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTool: UserTool = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    userTools.push(newTool);
    return serializeTool(newTool);
  },
  
  // Get all tools for a user
  async getToolsByUserId(userId: string) {
    const userToolsFiltered = userTools.filter(tool => tool.userId === userId);
    return userToolsFiltered.map(serializeTool);
  },
  
  // Get a specific tool by ID
  async getToolById(id: string) {
    const tool = userTools.find(tool => tool.id === id);
    return tool ? serializeTool(tool) : null;
  },
  
  // Get all tools (for gallery)
  async getAllTools() {
    return userTools.map(serializeTool);
  },
  
  // Update a tool
  async updateTool(id: string, data: Partial<Omit<UserTool, 'id' | 'userId' | 'createdAt'>>) {
    const toolIndex = userTools.findIndex(tool => tool.id === id);
    
    if (toolIndex === -1) {
      throw new Error('Tool not found');
    }
    
    userTools[toolIndex] = {
      ...userTools[toolIndex],
      ...data,
      updatedAt: new Date()
    };
    
    return serializeTool(userTools[toolIndex]);
  },
  
  // Delete a tool
  async deleteTool(id: string) {
    const toolIndex = userTools.findIndex(tool => tool.id === id);
    
    if (toolIndex === -1) {
      throw new Error('Tool not found');
    }
    
    const deletedTool = userTools[toolIndex];
    userTools = userTools.filter(tool => tool.id !== id);
    
    return serializeTool(deletedTool);
  }
};