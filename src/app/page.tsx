"use client";

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { v4 as uuidv4 } from 'uuid';
import AIChat from '@/components/ai/AIChat';

export default function Home() {
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [srcDoc, setSrcDoc] = useState('');
  const [activeTab, setActiveTab] = useState('html');
  const [title, setTitle] = useState('');
  const [showAI, setShowAI] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <head>
            <style>${css}</style>
          </head>
          <body>
            ${html}
            <script>${js}</script>
          </body>
        </html>
      `);
    }, 250);

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  const clearCode = () => {
    setHtml('');
    setCss('');
    setJs('');
    setTitle('');
  };

  const publishTool = async () => {
    if (!html && !css && !js) {
      alert('Please add some code before publishing');
      return;
    }

    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html, css, js, title }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish tool');
      }

      const { id } = await response.json();
      
      // Redirect to the tool page
      window.location.href = `/t/${id}`;
    } catch (error) {
      console.error('Error publishing tool:', error);
      alert('Failed to publish tool. Please try again.');
    }
  };

  const handleCodeGenerated = (generatedHtml: string) => {
    // Parse the HTML to extract CSS and JS if they are embedded
    const parser = new DOMParser();
    const doc = parser.parseFromString(generatedHtml, 'text/html');
    
    // Extract CSS from style tags
    const styleTags = doc.querySelectorAll('style');
    let extractedCSS = '';
    styleTags.forEach(styleTag => {
      extractedCSS += styleTag.innerHTML + '\n';
    });
    
    // Extract JavaScript from script tags
    const scriptTags = doc.querySelectorAll('script');
    let extractedJS = '';
    scriptTags.forEach(scriptTag => {
      extractedJS += scriptTag.innerHTML + '\n';
    });
    
    // Extract HTML body content
    const bodyContent = doc.body.innerHTML;
    
    // Update the state
    setHtml(bodyContent);
    setCss(extractedCSS);
    setJs(extractedJS);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            HTML Hub
          </h1>
          <p className="text-foreground/80 mt-3 text-lg">
            Create, preview, and share HTML/CSS/JS snippets instantly
          </p>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your tool a title (optional)"
            className="flex-1 max-w-md px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-card text-foreground shadow-sm transition-all duration-200"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowAI(!showAI)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-md font-medium"
            >
              {showAI ? 'Hide AI Assistant' : 'Show AI Assistant'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Section */}
          <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border glow-border">
            <div className="border-b border-border">
              <nav className="flex">
                <button
                  className={`px-5 py-3 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'html' 
                      ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                      : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
                  }`}
                  onClick={() => setActiveTab('html')}
                >
                  HTML
                </button>
                <button
                  className={`px-5 py-3 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'css' 
                      ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                      : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
                  }`}
                  onClick={() => setActiveTab('css')}
                >
                  CSS
                </button>
                <button
                  className={`px-5 py-3 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'js' 
                      ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                      : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
                  }`}
                  onClick={() => setActiveTab('js')}
                >
                  JavaScript
                </button>
              </nav>
            </div>

            <div className="h-[450px]">
              {activeTab === 'html' && (
                <Editor
                  height="100%"
                  language="html"
                  value={html}
                  onChange={(value) => setHtml(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    smoothScrolling: true,
                    fontFamily: "var(--font-mono)",
                    fontLigatures: true,
                    renderLineHighlight: "all",
                    scrollbar: {
                      vertical: "auto",
                      horizontal: "auto"
                    }
                  }}
                />
              )}
              {activeTab === 'css' && (
                <Editor
                  height="100%"
                  language="css"
                  value={css}
                  onChange={(value) => setCss(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    smoothScrolling: true,
                    fontFamily: "var(--font-mono)",
                    fontLigatures: true,
                    renderLineHighlight: "all",
                    scrollbar: {
                      vertical: "auto",
                      horizontal: "auto"
                    }
                  }}
                />
              )}
              {activeTab === 'js' && (
                <Editor
                  height="100%"
                  language="javascript"
                  value={js}
                  onChange={(value) => setJs(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    smoothScrolling: true,
                    fontFamily: "var(--font-mono)",
                    fontLigatures: true,
                    renderLineHighlight: "all",
                    scrollbar: {
                      vertical: "auto",
                      horizontal: "auto"
                    }
                  }}
                />
              )}
            </div>

            <div className="p-4 border-t border-border flex justify-between">
              <button
                onClick={clearCode}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
              >
                Clear
              </button>
              <button
                onClick={publishTool}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-md font-medium"
              >
                Publish
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-card rounded-xl shadow-lg overflow-hidden flex flex-col border border-border glow-border">
            <div className="border-b border-border p-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                Live Preview
              </h2>
            </div>
            <div className="flex-grow">
              <iframe
                srcDoc={srcDoc}
                title="preview"
                sandbox="allow-scripts"
                className="w-full h-full min-h-[450px] bg-white"
              />
            </div>
          </div>
        </div>

        {/* AI Chat Section */}
        {showAI && (
          <div className="mt-8 bg-card rounded-xl shadow-lg overflow-hidden border border-border glow-border">
            <div className="border-b border-border p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                    AI Code Generator
                  </h2>
                  <p className="text-sm text-foreground/70 mt-1">
                    Describe what you want to create, and I'll generate the code for you
                  </p>
                </div>
                <button 
                  onClick={() => setShowAI(false)}
                  className="text-foreground/50 hover:text-foreground transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="h-[450px]"> {/* Increased height from 350px to 450px */}
              <AIChat onCodeGenerated={handleCodeGenerated} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}