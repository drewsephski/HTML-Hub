import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// POST /api/tools - Create a new tool
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    
    const { title, html, css, js } = await request.json();
    
    // Validate input
    if (!title || !html) {
      return NextResponse.json({ error: 'Title and HTML are required' }, { status: 400 });
    }
    
    // Create the tool in the database (allow anonymous tools for gallery)
    const tool = await db.createTool({
      userId: userId || 'anonymous', // Use 'anonymous' for non-signed in users
      title,
      html,
      css: css || '',
      js: js || '',
    });
    
    return NextResponse.json(tool);
  } catch (error) {
    console.error('Error creating tool:', error);
    return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 });
  }
}

// GET /api/tools - Get all tools (for gallery) or user-specific tools
export async function GET(request: Request) {
  try {
    const { userId } = auth();
    
    // If user is signed in, return their tools only
    // If no user, return all tools for gallery
    let tools;
    if (userId) {
      tools = await db.getToolsByUserId(userId);
    } else {
      // For the gallery, we want to show all tools
      tools = await db.getAllTools();
    }
    
    // Return tools array directly for dashboard, object with tools property for gallery
    return NextResponse.json({ tools });
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}