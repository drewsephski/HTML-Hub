import { NextResponse } from 'next/server';

export async function GET() {
  // Create a ReadableStream that emits chunks with delays
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Send chunks with delays to simulate streaming
      const chunks = [
        "Hello, ",
        "this ",
        "is ",
        "a ",
        "streaming ",
        "response! ",
        "It ",
        "shows ",
        "how ",
        "data ",
        "can ",
        "be ",
        "sent ",
        "incrementally ",
        "to ",
        "the ",
        "client.\n\n",
        "Here's some code:\n",
        "```html\n",
        "<!DOCTYPE html>\n",
        "<html>\n",
        "<head>\n",
        "  <title>Test Page</title>\n",
        "</head>\n",
        "<body>\n",
        "  <h1>Hello World!</h1>\n",
        "  <p>This is a test.</p>\n",
        "</body>\n",
        "</html>\n",
        "```\n\n",
        "Streaming ",
        "is ",
        "great ",
        "for ",
        "AI ",
        "responses ",
        "that ",
        "take ",
        "time ",
        "to ",
        "generate."
      ];
      
      for (const chunk of chunks) {
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay
        controller.enqueue(encoder.encode(chunk));
      }
      
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Model-Used': 'Test Model',
      'X-Fallback-Occurred': 'false'
    }
  });
}