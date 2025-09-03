"use client";

import { useState, useEffect } from 'react';

export default function Gallery() {
  const [tools, setTools] = useState<any[]>([]);
  const [filteredTools, setFilteredTools] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/tools');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tools');
        }
        
        const data = await response.json();
        setTools(data.tools);
        setFilteredTools(data.tools);
      } catch (err) {
        setError('Failed to load tools');
        console.error('Error fetching tools:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = tools.filter(tool => 
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.html.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.css.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.js.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTools(filtered);
    } else {
      setFilteredTools(tools);
    }
  }, [searchTerm, tools]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground/80">Loading tools...</p>
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Tool Gallery</h1>
          <p className="text-foreground/80 mt-2">Browse and discover HTML/CSS/JS snippets created by the community</p>
        </header>

        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground shadow-sm transition-all duration-200"
            />
            <svg 
              className="absolute left-3 top-2.5 h-5 w-5 text-foreground/50" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-foreground">No tools found</h2>
            <p className="text-foreground/80 mt-2">
              {searchTerm ? 'Try a different search term' : 'Be the first to publish a tool!'}
            </p>
            {!searchTerm && (
              <a 
                href="/" 
                className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Create Your First Tool
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <div key={tool.id} className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-border">
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium text-foreground truncate">{tool.title}</h3>
                  <p className="text-sm text-foreground/70 mt-1">
                    Created: {new Date(tool.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <a 
                      href={`/t/${tool.id}`} 
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      View Tool
                    </a>
                    <div className="flex space-x-2">
                      {tool.html && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300">
                          HTML
                        </span>
                      )}
                      {tool.css && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300">
                          CSS
                        </span>
                      )}
                      {tool.js && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-300">
                          JS
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
