import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/tools/[id] - Get a specific tool by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    
    const tool = await db.getToolById(params.id);
    
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    // For public access to tools in the gallery, we don't check ownership
    // But we can still include user information if needed
    
    return NextResponse.json({ tool });
  } catch (error) {
    console.error('Error fetching tool:', error);
    return NextResponse.json({ error: 'Failed to fetch tool' }, { status: 500 });
  }
}

// PUT /api/tools/[id] - Update a specific tool
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const tool = await db.getToolById(params.id);
    
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    // Check if the tool belongs to the current user
    if (tool.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { title, html, css, js } = await request.json();
    
    // Validate input
    if (!title || !html) {
      return NextResponse.json({ error: 'Title and HTML are required' }, { status: 400 });
    }
    
    // Update the tool
    const updatedTool = await db.updateTool(params.id, {
      title,
      html,
      css: css || '',
      js: js || '',
    });
    
    return NextResponse.json(updatedTool);
  } catch (error) {
    console.error('Error updating tool:', error);
    return NextResponse.json({ error: 'Failed to update tool' }, { status: 500 });
  }
}

// DELETE /api/tools/[id] - Delete a specific tool
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const tool = await db.getToolById(params.id);
    
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    // Check if the tool belongs to the current user
    if (tool.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Delete the tool
    await db.deleteTool(params.id);
    
    return NextResponse.json({ message: 'Tool deleted successfully' });
  } catch (error) {
    console.error('Error deleting tool:', error);
    return NextResponse.json({ error: 'Failed to delete tool' }, { status: 500 });
  }
}