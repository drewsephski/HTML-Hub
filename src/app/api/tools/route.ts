import { NextResponse } from 'next/server';
import storage from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

// GET /api/tools - Get all tools
export async function GET() {
  try {
    const tools = storage.getAllTools();
    return NextResponse.json({ tools });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}

// POST /api/tools - Create a new tool
export async function POST(request: Request) {
  try {
    const { html, css, js, title } = await request.json();
    
    if (!html && !css && !js) {
      return NextResponse.json(
        { error: 'At least one of HTML, CSS, or JavaScript is required' },
        { status: 400 }
      );
    }
    
    const id = uuidv4();
    const tool = storage.saveTool(id, html, css, js, title || `Tool ${id.substring(0, 8)}`);
    
    return NextResponse.json({ id: tool.id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create tool' },
      { status: 500 }
    );
  }
}