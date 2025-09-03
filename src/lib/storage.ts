// Simple in-memory storage for tools
// In a production environment, this would be replaced with a proper database

interface Tool {
  id: string;
  html: string;
  css: string;
  js: string;
  createdAt: Date;
  title: string;
}

class InMemoryStorage {
  private tools: Map<string, Tool> = new Map();

  saveTool(id: string, html: string, css: string, js: string, title: string): Tool {
    const tool: Tool = {
      id,
      html,
      css,
      js,
      createdAt: new Date(),
      title: title || `Tool ${id.substring(0, 8)}`
    };
    
    this.tools.set(id, tool);
    return tool;
  }

  getTool(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  deleteTool(id: string): boolean {
    return this.tools.delete(id);
  }
}

const storage = new InMemoryStorage();
export default storage;