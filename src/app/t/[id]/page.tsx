"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ToolPage() {
  const params = useParams();
  const [tool, setTool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [srcDoc, setSrcDoc] = useState('');
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTool = async () => {
      if (!params.id) return;
      
      try {
        const response = await fetch(`/api/tools/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Tool not found');
          } else {
            setError('Failed to load tool');
          }
          return;
        }
        
        const data = await response.json();
        setTool(data.tool);
        
        setSrcDoc(`
          <html>
            <head>
              <style>${data.tool.css}</style>
            </head>
            <body>
              ${data.tool.html}
              <script>${data.tool.js}</script>
            </body>
          </html>
        `);
      } catch (err) {
        setError('Failed to load tool');
        console.error('Error fetching tool:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [params.id]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/t/${params.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground/80">Loading tool...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Error</h1>
          <p className="text-foreground/80 mt-2">{error}</p>
          <a href="/" className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Create Your Own Tool
          </a>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Tool Not Found</h1>
          <p className="text-foreground/80 mt-2">The tool you're looking for doesn't exist or has been removed.</p>
          <a href="/" className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Create Your Own Tool
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{tool.title}</h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-4">
            <div className="text-sm text-foreground/70">
              Created: {new Date(tool.createdAt).toLocaleString()}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors flex items-center"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <a 
                href="/" 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Create Your Own
              </a>
            </div>
          </div>
        </header>

        <div className="border-b border-border mb-6">
          <nav className="flex">
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'preview' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'}`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'code' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'}`}
              onClick={() => setActiveTab('code')}
            >
              Code
            </button>
          </nav>
        </div>

        {activeTab === 'preview' ? (
          <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
            <iframe
              srcDoc={srcDoc}
              title="tool-preview"
              sandbox="allow-scripts"
              className="w-full h-[600px]"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
              <div className="border-b border-border p-4">
                <h3 className="font-medium text-foreground">HTML</h3>
              </div>
              <pre className="p-4 bg-muted text-sm overflow-auto max-h-96 text-foreground">
                {tool.html || '// No HTML content'}
              </pre>
            </div>
            
            <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
              <div className="border-b border-border p-4">
                <h3 className="font-medium text-foreground">CSS</h3>
              </div>
              <pre className="p-4 bg-muted text-sm overflow-auto max-h-96 text-foreground">
                {tool.css || '// No CSS content'}
              </pre>
            </div>
            
            <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
              <div className="border-b border-border p-4">
                <h3 className="font-medium text-foreground">JavaScript</h3>
              </div>
              <pre className="p-4 bg-muted text-sm overflow-auto max-h-96 text-foreground">
                {tool.js || '// No JavaScript content'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
