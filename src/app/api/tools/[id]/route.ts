import { NextResponse } from 'next/server';
import storage from '@/lib/storage';

// GET /api/tools/[id] - Get a specific tool
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tool = storage.getTool(params.id);
    
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