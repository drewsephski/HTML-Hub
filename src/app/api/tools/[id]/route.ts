import { NextRequest, NextResponse } from 'next/server';
import storage from '@/lib/storage';

// GET /api/tools/[id] - Get a specific tool
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Resolve the params promise
    const resolvedParams = await params;
    const tool = storage.getTool(resolvedParams.id);
    
    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ tool });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tool' },
      { status: 500 }
    );
  }
}