"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
 
interface Tool {
  id: string;
  userId: string;
  title: string;
  html: string;
  css: string;
  js: string;
  createdAt: string;
  updatedAt: string;
}

export default function Gallery() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, html, css, js

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/tools');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tools');
        }
        
        const data = await response.json();
        // The API returns an object with a tools property
        setTools(data.tools || []);
        setFilteredTools(data.tools || []);
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
    let result = tools;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(tool => 
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.html.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.css.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.js.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filter !== 'all') {
      result = result.filter(tool => {
        if (filter === 'html') return tool.html && tool.html.trim() !== '';
        if (filter === 'css') return tool.css && tool.css.trim() !== '';
        if (filter === 'js') return tool.js && tool.js.trim() !== '';
        return true;
      });
    }
    
    setFilteredTools(result);
  }, [searchTerm, filter, tools]);

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
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Tool Gallery</h1>
          <p className="text-foreground/80 mt-2">Browse and discover HTML/CSS/JS snippets created by the community</p>
        </header>

        {/* Search and Filter Controls */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tools..."
              className="w-full px-4 py-2 border border-border rounded-lg focus-enhanced bg-card text-foreground shadow-sm transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                filter === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                filter === 'html' 
                  ? 'bg-red-500/20 text-red-700 dark:text-red-300' 
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
              onClick={() => setFilter('html')}
            >
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              HTML
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                filter === 'css' 
                  ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300' 
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
              onClick={() => setFilter('css')}
            >
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              CSS
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                filter === 'js' 
                  ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' 
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
              onClick={() => setFilter('js')}
            >
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              JS
            </button>
          </div>
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-foreground">No tools found</h2>
            <p className="text-foreground/80 mt-2">
              {searchTerm ? 'Try a different search term' : 'Be the first to publish a tool!'}
            </p>
            <Link
              href="/"
              className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Create Your First Tool
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool, index) => (
              <div 
                key={tool.id} 
                className="tool-card gradient-border bg-card rounded-xl shadow-md overflow-hidden border border-border pop-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-5 border-b border-border">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-foreground truncate">{tool.title}</h3>
                    <span className="text-xs text-foreground/50 whitespace-nowrap ml-2">
                      {new Date(tool.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70 mt-2 line-clamp-2">
                    {tool.html?.substring(0, 100) || tool.css?.substring(0, 100) || tool.js?.substring(0, 100) || 'No description'}
                  </p>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/t/${tool.id}`}
                      className="shine-effect px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      View Tool
                    </Link>
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