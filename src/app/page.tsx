"use client";

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { v4 as uuidv4 } from 'uuid';
import AIChat from '@/components/ai/AIChat';

// Loading skeleton component
const SkeletonLoader = ({ className }: { className: string }) => (
  <div className={`skeleton ${className}`}></div>
);

export default function Home() {
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [srcDoc, setSrcDoc] = useState('');
  const [activeTab, setActiveTab] = useState('html');
  const [title, setTitle] = useState('');
  const [showAI, setShowAI] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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

  // Touch/swipe gesture support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left - next tab
      if (activeTab === 'html') setActiveTab('css');
      else if (activeTab === 'css') setActiveTab('js');
    }

    if (isRightSwipe) {
      // Swipe right - previous tab
      if (activeTab === 'js') setActiveTab('css');
      else if (activeTab === 'css') setActiveTab('html');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActiveTab('html');
            break;
          case '2':
            e.preventDefault();
            setActiveTab('css');
            break;
          case '3':
            e.preventDefault();
            setActiveTab('js');
            break;
          case 'k':
            e.preventDefault();
            clearCode();
            break;
          case 'Enter':
            e.preventDefault();
            if (!isLoading) publishTool();
            break;
          case 'a':
            e.preventDefault();
            setShowAI(!showAI);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, showAI]);

  const clearCode = () => {
    setHtml('');
    setCss('');
    setJs('');
    setTitle('');
  };

  // New function to format code using a simple formatter
  const formatCode = (code: string, language: 'html' | 'css' | 'js') => {
    if (!code.trim()) return code;
    
    try {
      // Simple formatting based on language
      switch (language) {
        case 'html':
          return code
            .replace(/></g, '>\n<')
            .replace(/(>)(\s*)([^<])/g, '$1$3')
            .replace(/(<[^>]+>)([^<])/g, '$1\n$2')
            .replace(/\n{2,}/g, '\n')
            .trim();
        case 'css':
          return code
            .replace(/([{}:;,])/g, '$1\n')
            .replace(/([^{};]+)\{/g, '$1 {\n')
            .replace(/([^{};]+)\}/g, '$1\n}')
            .replace(/\n{2,}/g, '\n')
            .replace(/^[ \t]+/gm, '  ')
            .trim();
        case 'js':
          return code
            .replace(/([{}();,])/g, '$1\n')
            .replace(/(if|for|while|function|class|switch|try|catch|finally)(\s*\()/g, '$1 $2')
            .replace(/\n{2,}/g, '\n')
            .replace(/^[ \t]+/gm, '  ')
            .trim();
        default:
          return code;
      }
    } catch (error) {
      console.error('Error formatting code:', error);
      return code;
    }
  };

  // New function to format all code
  const formatAllCode = () => {
    setHtml(formatCode(html, 'html'));
    setCss(formatCode(css, 'css'));
    setJs(formatCode(js, 'js'));
  };

  // New function to create a new template
  const createTemplate = () => {
    const newTemplate = {
      id: Date.now().toString(),
      name: title || 'Untitled Template',
      html: html,
      css: css,
      js: js,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const templates = JSON.parse(localStorage.getItem('templates') || '[]');
    templates.push(newTemplate);
    localStorage.setItem('templates', JSON.stringify(templates));
    
    alert('Template saved successfully!');
  };

  // New function to load templates from localStorage
  const loadTemplates = () => {
    const templates = JSON.parse(localStorage.getItem('templates') || '[]');
    return templates;
  };

  const publishTool = async () => {
    if (!html && !css && !js) {
      alert('Please add some code before publishing');
      return;
    }

    setIsLoading(true);
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

      // Add achievement for first publish
      if (!achievements.includes('first-publish')) {
        setAchievements(prev => [...prev, 'first-publish']);
      }

      // Redirect to the tool page
      window.location.href = `/t/${id}`;
    } catch (error) {
      console.error('Error publishing tool:', error);
      alert('Failed to publish tool. Please try again.');
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-background bg-pattern p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
            className="flex-1 max-w-md px-4 py-3 border border-border rounded-lg focus-enhanced bg-card text-foreground shadow-sm transition-all duration-200"
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover-lift btn-enhanced shadow-md font-medium"
            >
              Templates
            </button>
            <button
              onClick={formatAllCode}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover-lift btn-enhanced shadow-md font-medium"
            >
              Format Code
            </button>
            <button
              onClick={createTemplate}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover-lift btn-enhanced shadow-md font-medium"
            >
              Save Template
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover-lift btn-enhanced shadow-md font-medium"
            >
              Share
            </button>
            <button
              onClick={() => setShowAI(!showAI)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover-lift btn-enhanced shadow-md font-medium"
            >
              {showAI ? 'Hide AI Assistant' : 'Show AI Assistant'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Section */}
          <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border glow-border">
            <div className="border-b border-border">
              <nav
                className="flex"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <button
                  className={`px-5 py-3 font-medium text-sm tab-transition ${activeTab === 'html'
                      ? 'bg-primary/10 text-primary border-b-2 border-primary'
                      : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
                    }`}
                  onClick={() => setActiveTab('html')}
                >
                  HTML
                </button>
                <button
                  className={`px-5 py-3 font-medium text-sm tab-transition ${activeTab === 'css'
                      ? 'bg-primary/10 text-primary border-b-2 border-primary'
                      : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
                    }`}
                  onClick={() => setActiveTab('css')}
                >
                  CSS
                </button>
                <button
                  className={`px-5 py-3 font-medium text-sm tab-transition ${activeTab === 'js'
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
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover-lift btn-enhanced transition-all duration-200 font-medium"
              >
                Clear
              </button>
              <button
                onClick={publishTool}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover-lift btn-enhanced shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Publishing...
                  </div>
                ) : (
                  'Publish'
                )}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-card rounded-xl shadow-lg overflow-hidden flex flex-col border border-border glow-border">
            <div className="border-b border-border p-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full breathing"></span>
                Live Preview
              </h2>
            </div>
            <div className="flex-grow">
              {isLoading ? (
                <div className="w-full h-full min-h-[450px] bg-white p-4">
                  <SkeletonLoader className="h-8 w-3/4 mb-4" />
                  <SkeletonLoader className="h-4 w-full mb-2" />
                  <SkeletonLoader className="h-4 w-5/6 mb-2" />
                  <SkeletonLoader className="h-4 w-4/5 mb-4" />
                  <SkeletonLoader className="h-32 w-full mb-4" />
                  <SkeletonLoader className="h-8 w-1/2" />
                </div>
              ) : (
                <iframe
                  srcDoc={srcDoc}
                  title="preview"
                  sandbox="allow-scripts"
                  className="w-full h-full min-h-[450px] bg-white"
                />
              )}
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
                    <span className="w-3 h-3 bg-blue-500 rounded-full breathing"></span>
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

        {/* Achievement Badges */}
        {achievements.length > 0 && (
          <div className="fixed top-20 right-4 z-50">
            <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-yellow-500">🏆</span>
                Achievements Unlocked!
              </h4>
              <div className="space-y-2">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    <span className="text-foreground">
                      {achievement === 'first-publish' && 'First Tool Published!'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Modal */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to HTML Hub! 🎉</h2>
                <p className="text-foreground/70">Let's get you started with creating your first web tool</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">1</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Write Your Code</h3>
                    <p className="text-sm text-foreground/70">Use the HTML, CSS, and JavaScript editors to create your tool</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">2</div>
                  <div>
                    <h3 className="font-semibold text-foreground">See Live Preview</h3>
                    <p className="text-sm text-foreground/70">Watch your changes appear instantly in the preview panel</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">3</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Publish & Share</h3>
                    <p className="text-sm text-foreground/70">Click publish to share your creation with the world</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowOnboarding(false)}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Skip Tour
                </button>
                <button
                  onClick={() => setShowOnboarding(false)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="border-b border-border p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Code Templates</h2>
                    <p className="text-foreground/70 mt-1">Choose from pre-built templates to get started quickly</p>
                  </div>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="text-foreground/50 hover:text-foreground transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Your Saved Templates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loadTemplates().map((template: any) => (
                      <div 
                        key={template.id} 
                        className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer tool-card"
                        onClick={() => {
                          setHtml(template.html);
                          setCss(template.css);
                          setJs(template.js);
                          setTitle(template.name);
                          setShowTemplates(false);
                        }}
                      >
                        <div className="w-full h-24 bg-gradient-to-br from-indigo-100 to-purple-200 rounded mb-3 flex items-center justify-center">
                          <span className="text-purple-600 font-bold">💾</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                        <p className="text-sm text-foreground/70">
                          Saved: {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    
                    {loadTemplates().length === 0 && (
                      <div className="col-span-full text-center py-8 text-foreground/70">
                        <p>You haven't saved any templates yet.</p>
                        <p className="text-sm mt-2">Create a template by clicking "Save Template" after building something you want to reuse.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Pre-built Templates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Basic Templates */}
                    <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer tool-card"
                      onClick={() => {
                        setHtml('<div class="container">\n  <h1>Hello World</h1>\n  <p>Welcome to HTML Hub!</p>\n</div>');
                        setCss('.container {\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 20px;\n  text-align: center;\n}\n\nh1 {\n  color: #333;\n  font-size: 2rem;\n}\n\np {\n  color: #666;\n  font-size: 1.1rem;\n}');
                        setJs('// Add your JavaScript here\nconsole.log("Hello from HTML Hub!");');
                        setTitle('Basic Template');
                        setShowTemplates(false);
                      }}>
                      <div className="w-full h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded mb-3 flex items-center justify-center">
                        <span className="text-blue-600 font-bold">📄</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">Basic Layout</h3>
                      <p className="text-sm text-foreground/70">Simple HTML structure with basic styling</p>
                    </div>

                    <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer tool-card"
                      onClick={() => {
                        setHtml('<div class="card">\n  <h2>Interactive Card</h2>\n  <p>Click the button below!</p>\n  <button id="myButton">Click Me</button>\n  <p id="message"></p>\n</div>');
                        setCss('.card {\n  max-width: 400px;\n  margin: 20px auto;\n  padding: 20px;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n}\n\nbutton {\n  background: #007bff;\n  color: white;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 5px;\n  cursor: pointer;\n  transition: background 0.3s;\n}\n\nbutton:hover {\n  background: #0056b3;\n}');
                        setJs('document.getElementById("myButton").addEventListener("click", function() {\n  document.getElementById("message").textContent = "Button clicked! 🎉";\n});');
                        setTitle('Interactive Card');
                        setShowTemplates(false);
                      }}>
                      <div className="w-full h-24 bg-gradient-to-br from-green-100 to-green-200 rounded mb-3 flex items-center justify-center">
                        <span className="text-green-600 font-bold">🎯</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">Interactive Card</h3>
                      <p className="text-sm text-foreground/70">Card with button interaction</p>
                    </div>

                    <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer tool-card"
                      onClick={() => {
                        setHtml('<div class="calculator">\n  <input type="text" id="display" readonly>\n  <div class="buttons">\n    <button onclick="appendNumber(7)">7</button>\n    <button onclick="appendNumber(8)">8</button>\n    <button onclick="appendNumber(9)">9</button>\n    <button onclick="setOperation(\'+\')">+</button>\n    <button onclick="appendNumber(4)">4</button>\n    <button onclick="appendNumber(5)">5</button>\n    <button onclick="appendNumber(6)">6</button>\n    <button onclick="setOperation(\'-\')">-</button>\n    <button onclick="appendNumber(1)">1</button>\n    <button onclick="appendNumber(2)">2</button>\n    <button onclick="appendNumber(3)">3</button>\n    <button onclick="setOperation(\'*\')">×</button>\n    <button onclick="appendNumber(0)">0</button>\n    <button onclick="calculate()">=</button>\n    <button onclick="clearDisplay()">C</button>\n    <button onclick="setOperation(\'/\')">÷</button>\n  </div>\n</div>');
                        setCss('.calculator {\n  max-width: 300px;\n  margin: 20px auto;\n  padding: 20px;\n  border: 1px solid #ddd;\n  border-radius: 10px;\n  background: #f8f9fa;\n}\n\n#display {\n  width: 100%;\n  height: 50px;\n  font-size: 24px;\n  text-align: right;\n  margin-bottom: 10px;\n  padding: 5px;\n  border: 1px solid #ccc;\n  border-radius: 5px;\n}\n\n.buttons {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 5px;\n}\n\nbutton {\n  height: 50px;\n  font-size: 18px;\n  border: 1px solid #ccc;\n  border-radius: 5px;\n  background: white;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n\nbutton:hover {\n  background: #e9ecef;\n}');
                        setJs('let display = document.getElementById("display");\nlet currentInput = "";\nlet operator = "";\nlet previousInput = "";\n\nfunction appendNumber(number) {\n  currentInput += number;\n  display.value = currentInput;\n}\n\nfunction setOperation(op) {\n  if (currentInput !== "") {\n    if (previousInput !== "") {\n      calculate();\n    }\n    operator = op;\n    previousInput = currentInput;\n    currentInput = "";\n  }\n}\n\nfunction calculate() {\n  if (previousInput !== "" && currentInput !== "") {\n    let result;\n    const prev = parseFloat(previousInput);\n    const current = parseFloat(currentInput);\n    \n    switch (operator) {\n      case "+":\n        result = prev + current;\n        break;\n      case "-":\n        result = prev - current;\n        break;\n      case "*":\n        result = prev * current;\n        break;\n      case "/":\n        result = prev / current;\n        break;\n      default:\n        return;\n    }\n    \n    display.value = result;\n    currentInput = result.toString();\n    previousInput = "";\n    operator = "";\n  }\n}\n\nfunction clearDisplay() {\n  display.value = "";\n  currentInput = "";\n  previousInput = "";\n  operator = "";\n}');
                        setTitle('Calculator');
                        setShowTemplates(false);
                      }}>
                      <div className="w-full h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded mb-3 flex items-center justify-center">
                        <span className="text-purple-600 font-bold">🧮</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">Calculator</h3>
                      <p className="text-sm text-foreground/70">Fully functional calculator</p>
                    </div>

                    <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer tool-card"
                      onClick={() => {
                        setHtml('<div class="todo-app">\n  <h1>Todo List</h1>\n  <div class="input-container">\n    <input type="text" id="todoInput" placeholder="Add a new task...">\n    <button onclick="addTodo()">Add</button>\n  </div>\n  <ul id="todoList"></ul>\n</div>');
                        setCss('.todo-app {\n  max-width: 400px;\n  margin: 20px auto;\n  padding: 20px;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  font-family: Arial, sans-serif;\n}\n\n.input-container {\n  display: flex;\n  gap: 10px;\n  margin-bottom: 20px;\n}\n\ninput {\n  flex: 1;\n  padding: 8px;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n}\n\nbutton {\n  padding: 8px 16px;\n  background: #007bff;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\nbutton:hover {\n  background: #0056b3;\n}\n\nul {\n  list-style: none;\n  padding: 0;\n}\n\nli {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 0;\n  border-bottom: 1px solid #eee;\n}\n\n.completed {\n  text-decoration: line-through;\n  color: #888;\n}');
                        setJs('function addTodo() {\n  const input = document.getElementById("todoInput");\n  const text = input.value.trim();\n  \n  if (text !== "") {\n    const li = document.createElement("li");\n    li.innerHTML = `\n      <span onclick="toggleComplete(this)">${text}</span>\n      <button onclick="deleteTodo(this)">Delete</button>\n    `;\n    document.getElementById("todoList").appendChild(li);\n    input.value = "";\n  }\n}\n\nfunction toggleComplete(element) {\n  element.classList.toggle("completed");\n}\n\nfunction deleteTodo(button) {\n  button.parentElement.remove();\n}\n\n// Enter key support\ndocument.getElementById("todoInput").addEventListener("keypress", function(e) {\n  if (e.key === "Enter") {\n    addTodo();\n  }\n});');
                        setTitle('Todo List');
                        setShowTemplates(false);
                      }}>
                      <div className="w-full h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded mb-3 flex items-center justify-center">
                        <span className="text-yellow-600 font-bold">📝</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">Todo List</h3>
                      <p className="text-sm text-foreground/70">Task management app</p>
                    </div>

                    <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer tool-card"
                      onClick={() => {
                        setHtml('<div class="weather-app">\n  <h1>Weather App</h1>\n  <div class="search-container">\n    <input type="text" id="cityInput" placeholder="Enter city name...">\n    <button onclick="getWeather()">Search</button>\n  </div>\n  <div id="weatherInfo" class="weather-info">\n    <p>Enter a city name to get weather information</p>\n  </div>\n</div>');
                        setCss('.weather-app {\n  max-width: 400px;\n  margin: 20px auto;\n  padding: 20px;\n  border: 1px solid #ddd;\n  border-radius: 10px;\n  text-align: center;\n  font-family: Arial, sans-serif;\n}\n\n.search-container {\n  display: flex;\n  gap: 10px;\n  margin-bottom: 20px;\n}\n\ninput {\n  flex: 1;\n  padding: 10px;\n  border: 1px solid #ccc;\n  border-radius: 5px;\n}\n\nbutton {\n  padding: 10px 20px;\n  background: #007bff;\n  color: white;\n  border: none;\n  border-radius: 5px;\n  cursor: pointer;\n}\n\nbutton:hover {\n  background: #0056b3;\n}\n\n.weather-info {\n  margin-top: 20px;\n  padding: 20px;\n  background: #f8f9fa;\n  border-radius: 8px;\n}');
                        setJs('async function getWeather() {\n  const city = document.getElementById("cityInput").value.trim();\n  const weatherInfo = document.getElementById("weatherInfo");\n  \n  if (!city) {\n    weatherInfo.innerHTML = "<p>Please enter a city name</p>";\n    return;\n  }\n  \n  try {\n    // Using OpenWeatherMap API (you\'ll need to add your API key)\n    const apiKey = "YOUR_API_KEY_HERE";\n    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);\n    const data = await response.json();\n    \n    if (data.cod === 200) {\n      weatherInfo.innerHTML = `\n        <h2>${data.name}, ${data.sys.country}</h2>\n        <p>Temperature: ${Math.round(data.main.temp)}°C</p>\n        <p>Weather: ${data.weather[0].description}</p>\n        <p>Humidity: ${data.main.humidity}%</p>\n      `;\n    } else {\n      weatherInfo.innerHTML = "<p>City not found. Please try again.</p>";\n    }\n  } catch (error) {\n    weatherInfo.innerHTML = "<p>Error fetching weather data. Please try again.</p>";\n  }\n}\n\n// Enter key support\ndocument.getElementById("cityInput").addEventListener("keypress", function(e) {\n  if (e.key === "Enter") {\n    getWeather();\n  }\n});');
                        setTitle('Weather App');
                        setShowTemplates(false);
                      }}>
                      <div className="w-full h-24 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded mb-3 flex items-center justify-center">
                        <span className="text-cyan-600 font-bold">🌤️</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">Weather App</h3>
                      <p className="text-sm text-foreground/70">Weather information display</p>
                    </div>

                    <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer tool-card"
                      onClick={() => {
                        setHtml('<div class="game">\n  <h1>Snake Game</h1>\n  <canvas id="gameCanvas" width="400" height="400"></canvas>\n  <div class="score">Score: <span id="score">0</span></div>\n  <button id="startButton">Start Game</button>\n</div>');
                        setCss('.game {\n  text-align: center;\n  font-family: Arial, sans-serif;\n}\n\ncanvas {\n  border: 2px solid #333;\n  background: #f0f0f0;\n  margin: 20px auto;\n  display: block;\n}\n\n.score {\n  font-size: 24px;\n  margin: 10px 0;\n}\n\nbutton {\n  padding: 10px 20px;\n  font-size: 16px;\n  background: #4CAF50;\n  color: white;\n  border: none;\n  border-radius: 5px;\n  cursor: pointer;\n}\n\nbutton:hover {\n  background: #45a049;\n}');
                        setJs('const canvas = document.getElementById("gameCanvas");\nconst ctx = canvas.getContext("2d");\nconst startButton = document.getElementById("startButton");\nconst scoreElement = document.getElementById("score");\n\nlet snake = [{x: 200, y: 200}];\nlet food = {x: 100, y: 100};\nlet dx = 0;\nlet dy = 0;\nlet score = 0;\nlet gameRunning = false;\n\nstartButton.addEventListener("click", startGame);\n\ndocument.addEventListener("keydown", changeDirection);\n\nfunction startGame() {\n  if (!gameRunning) {\n    gameRunning = true;\n    snake = [{x: 200, y: 200}];\n    dx = 0;\n    dy = 0;\n    score = 0;\n    scoreElement.textContent = score;\n    generateFood();\n    gameLoop();\n  }\n}\n\nfunction changeDirection(event) {\n  if (!gameRunning) return;\n  \n  const LEFT_KEY = 37;\n  const RIGHT_KEY = 39;\n  const UP_KEY = 38;\n  const DOWN_KEY = 40;\n  \n  const keyPressed = event.keyCode;\n  const goingUp = dy === -10;\n  const goingDown = dy === 10;\n  const goingRight = dx === 10;\n  const goingLeft = dx === -10;\n  \n  if (keyPressed === LEFT_KEY && !goingRight) {\n    dx = -10;\n    dy = 0;\n  }\n  if (keyPressed === UP_KEY && !goingDown) {\n    dx = 0;\n    dy = -10;\n  }\n  if (keyPressed === RIGHT_KEY && !goingLeft) {\n    dx = 10;\n    dy = 0;\n  }\n  if (keyPressed === DOWN_KEY && !goingUp) {\n    dx = 0;\n    dy = 10;\n  }\n}\n\nfunction generateFood() {\n  food.x = Math.floor(Math.random() * 39) * 10;\n  food.y = Math.floor(Math.random() * 39) * 10;\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, canvas.width, canvas.height);\n  \n  // Draw snake\n  ctx.fillStyle = "green";\n  for (let segment of snake) {\n    ctx.fillRect(segment.x, segment.y, 10, 10);\n  }\n  \n  // Draw food\n  ctx.fillStyle = "red";\n  ctx.fillRect(food.x, food.y, 10, 10);\n}\n\nfunction moveSnake() {\n  const head = {x: snake[0].x + dx, y: snake[0].y + dy};\n  snake.unshift(head);\n  \n  if (head.x === food.x && head.y === food.y) {\n    score += 10;\n    scoreElement.textContent = score;\n    generateFood();\n  } else {\n    snake.pop();\n  }\n}\n\nfunction checkCollision() {\n  const head = snake[0];\n  \n  // Wall collision\n  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {\n    gameOver();\n  }\n  \n  // Self collision\n  for (let i = 1; i < snake.length; i++) {\n    if (head.x === snake[i].x && head.y === snake[i].y) {\n      gameOver();\n    }\n  }\n}\n\nfunction gameOver() {\n  gameRunning = false;\n  alert(`Game Over! Score: ${score}`);\n}\n\nfunction gameLoop() {\n  if (!gameRunning) return;\n  \n  moveSnake();\n  checkCollision();\n  draw();\n  \n  setTimeout(gameLoop, 100);\n}');
                        setTitle('Snake Game');
                        setShowTemplates(false);
                      }}>
                      <div className="w-full h-24 bg-gradient-to-br from-red-100 to-red-200 rounded mb-3 flex items-center justify-center">
                        <span className="text-red-600 font-bold">🐍</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">Snake Game</h3>
                      <p className="text-sm text-foreground/70">Classic arcade game</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Share Your Creation</h2>
                <p className="text-foreground/70">Share your HTML tool with the world</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3">Share Options</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        const url = window.location.href;
                        navigator.clipboard.writeText(url);
                        alert('Link copied to clipboard!');
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                    >
                      <span className="text-primary">🔗</span>
                      <div className="text-left">
                        <div className="font-medium text-foreground">Copy Link</div>
                        <div className="text-sm text-foreground/70">Share the current URL</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        const code = `HTML: ${html}\nCSS: ${css}\nJS: ${js}`;
                        navigator.clipboard.writeText(code);
                        alert('Code copied to clipboard!');
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-secondary/10 hover:bg-secondary/20 rounded-lg transition-colors"
                    >
                      <span className="text-secondary-foreground">📋</span>
                      <div className="text-left">
                        <div className="font-medium text-foreground">Copy Code</div>
                        <div className="text-sm text-foreground/70">Copy all code to clipboard</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        const embedCode = `<iframe src="${window.location.href}" width="600" height="400" frameborder="0"></iframe>`;
                        navigator.clipboard.writeText(embedCode);
                        alert('Embed code copied to clipboard!');
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors"
                    >
                      <span className="text-accent-foreground">📺</span>
                      <div className="text-left">
                        <div className="font-medium text-foreground">Embed Code</div>
                        <div className="text-sm text-foreground/70">Get embeddable iframe code</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3">Export Options</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        const data = { html, css, js, title };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${title || 'html-tool'}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => {
                        const htmlContent = `<!DOCTYPE html>\n<html>\n<head>\n  <title>${title || 'HTML Tool'}</title>\n  <style>${css}</style>\n</head>\n<body>\n  ${html}\n  <script>${js}</script>\n</body>\n</html>`;
                        const blob = new Blob([htmlContent], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${title || 'html-tool'}.html`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
                    >
                      HTML
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}