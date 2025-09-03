"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
 
 interface Tool {
  id: string;
  title: string;
  html: string;
  css: string;
  js: string;
  createdAt: string;
 }

export default function ToolPage() {
  const params = useParams<{ id: string }>();
  const [tool, setTool] = useState<Tool | null>(null);
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

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
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
          <Link href="/" className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Create Your Own Tool
          </Link>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Tool Not Found</h1>
          <p className="text-foreground/80 mt-2">The tool you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/" className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Create Your Own Tool
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground gradient-text">{tool.title}</h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-4">
            <div className="text-sm text-foreground/70">
              Created: {new Date(tool.createdAt).toLocaleString()}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors flex items-center gap-2"
              >
                {copied ? 'Copied!' : 'Copy Link'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <Link 
                href="/" 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                Create Your Own
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        <div className="border-b border-border mb-6">
          <nav className="flex">
            <button
              className={`px-4 py-2 font-medium text-sm tab-transition ${
                activeTab === 'preview' 
                  ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                  : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm tab-transition ${
                activeTab === 'code' 
                  ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                  : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
              }`}
              onClick={() => setActiveTab('code')}
            >
              Code
            </button>
          </nav>
        </div>

        {activeTab === 'preview' ? (
          <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border glow-border">
            <div className="border-b border-border p-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full breathing"></span>
                Live Preview
              </h2>
            </div>
            <iframe
              srcDoc={srcDoc}
              title="tool-preview"
              sandbox="allow-scripts"
              className="w-full h-[600px]"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border glow-border">
              <div className="border-b border-border p-4 flex justify-between items-center">
                <h3 className="font-medium text-foreground">HTML</h3>
                <button 
                  onClick={() => copyCode(tool.html)}
                  className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="p-4 bg-muted text-sm overflow-auto max-h-96 text-foreground">
                {tool.html || '// No HTML content'}
              </pre>
            </div>
            
            <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border glow-border">
              <div className="border-b border-border p-4 flex justify-between items-center">
                <h3 className="font-medium text-foreground">CSS</h3>
                <button 
                  onClick={() => copyCode(tool.css)}
                  className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="p-4 bg-muted text-sm overflow-auto max-h-96 text-foreground">
                {tool.css || '// No CSS content'}
              </pre>
            </div>
            
            <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border glow-border">
              <div className="border-b border-border p-4 flex justify-between items-center">
                <h3 className="font-medium text-foreground">JavaScript</h3>
                <button 
                  onClick={() => copyCode(tool.js)}
                  className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  Copy
                </button>
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