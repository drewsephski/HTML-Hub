"use client";

import { useState, useRef, useEffect } from 'react';

export default function TestStreaming() {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const responseEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    responseEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [response]);

  const handleTestStream = async () => {
    setIsLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/test-stream');
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        // Decode and append the chunk to the response
        const chunk = decoder.decode(value, { stream: true });
        setResponse(prev => prev + chunk);
        
        // Scroll to bottom to show new content
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error occurred while fetching stream');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Streaming Test</h1>
        
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <button
            onClick={handleTestStream}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Streaming...' : 'Test Streaming'}
          </button>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Streamed Response</h2>
          <div className="bg-muted p-4 rounded-lg min-h-[200px] max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{response || 'Click the button above to test streaming'}</pre>
            <div ref={responseEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}