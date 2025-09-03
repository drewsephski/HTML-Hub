"use client";

import { useState, useRef, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

// Define the available free models (reliable models only in specified order)
const FREE_MODELS = [
  { id: 'moonshotai/kimi-k2:free', name: 'Kimi K2' },
  { id: 'z-ai/glm-4.5-air:free', name: 'GLM-4.5 Air' },
  { id: 'deepseek/deepseek-chat-v3.1:free', name: 'DeepSeek V3.1' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B' }
];

export default function AIChat({ onCodeGenerated }: { onCodeGenerated: (html: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Set Kimi K2 as the default model
  const [selectedModel, setSelectedModel] = useState(FREE_MODELS[0].id);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const streamBufferRef = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to render message content with syntax highlighting
  const renderMessageContent = (content: string) => {
    // Split content into code blocks and regular text
    const parts = [];
    let lastIndex = 0;
    const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add code block with syntax highlighting
      const language = match[1] || 'text';
      const code = match[2];
      
      parts.push(
        <div key={`code-${match.index}`} className="my-2 rounded-lg overflow-hidden">
          <SyntaxHighlighter 
            language={language} 
            style={oneDark}
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {content.substring(lastIndex)}
        </span>
      );
    }

    // If no code blocks found, just return the content as text
    if (parts.length === 0) {
      return <span>{content}</span>;
    }

    return parts;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    streamBufferRef.current = '';

    try {
      // Call the AI API with a longer timeout
      const controller = new AbortController();
      // Set timeout to 60 seconds (frontend timeout)
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModel
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }

      // Create initial AI message
      const aiMessageId = Date.now().toString();
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        model: response.headers.get('X-Model-Used') || FREE_MODELS.find(m => m.id === selectedModel)?.name || 'Unknown'
      };

      setMessages(prev => [...prev, aiMessage]);

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Check if fallback occurred
          const fallbackOccurred = response.headers.get('X-Fallback-Occurred') === 'true';
          if (fallbackOccurred) {
            const fallbackMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `Note: The selected model was unavailable, so I used ${aiMessage.model} instead to generate this response.`,
              model: aiMessage.model
            };
            setMessages(prev => [...prev, fallbackMessage]);
          }
          
          // Process the complete response for code extraction
          if (streamBufferRef.current.includes('<!DOCTYPE html') || streamBufferRef.current.includes('<html')) {
            // Extract HTML content from the response
            const htmlMatch = streamBufferRef.current.match(/```html\s*([\s\S]*?)\s*```/);
            if (htmlMatch && htmlMatch[1]) {
              onCodeGenerated(htmlMatch[1]);
            } else {
              // If no code block found, check if the entire response is HTML
              if (streamBufferRef.current.trim().startsWith('<')) {
                onCodeGenerated(streamBufferRef.current);
              }
            }
          }
          
          break;
        }

        // Decode and append the chunk to the message
        const chunk = decoder.decode(value, { stream: true });
        streamBufferRef.current += chunk;
        
        // Update the message content
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: streamBufferRef.current } 
            : msg
        ));
        
        // Scroll to bottom to show new content
        scrollToBottom();
      }
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout: The AI service is taking longer than expected to respond. This might be due to high demand. Please try again with a simpler request or try a different model.';
      } else if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        errorMessage = 'Network error: Unable to connect to the AI service. Please check your internet connection and try again.';
      } else if (error.message && error.message.includes('auth')) {
        errorMessage = 'Authentication error: Invalid or missing API key.';
      } else if (error.message && (error.message.includes('timeout') || error.message.includes('aborted'))) {
        errorMessage = 'Request timeout: The AI service is taking longer than expected to respond. This might be due to high demand. Please try again with a simpler request.';
      } else if (error.message && error.message.includes('credits')) {
        errorMessage = 'Insufficient credits: Your OpenRouter account has run out of credits. Please visit https://openrouter.ai/settings/credits to add more credits.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      const errorMessageObj: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: errorMessage,
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-chat-container flex flex-col h-full">
      <div className="ai-chat-messages flex-1 overflow-y-auto p-4 space-y-0 bg-background rounded-lg">
        {messages.length === 0 ? (
          <div className="text-center text-foreground/70 py-8 rounded-lg bg-card border border-border h-full flex flex-col justify-center">
            <div className="mb-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="font-extrabold mb-1 text-3xl text-foreground tracking-tight">Let's Cook</h3>
            </div>
            <p className="text-lg mb-1 font-semibold text-foreground/90 tracking-wide">Examples:</p>
            <div className="max-w-md mx-auto text-left space-y-1 mt-4">
              <div className="flex items-start gap-3">
                <span className="text-primary mt-0 text-lg">•</span>
                <span className="text-base text-foreground leading-relaxed">&quot;Create a responsive navbar with logo and menu&quot;</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary mt-0 text-lg">•</span>
                <span className="text-base text-foreground leading-relaxed">&quot;Make a card with image, title and description&quot;</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary mt-0 text-lg">•</span>
                <span className="text-base text-foreground leading-relaxed mb-6">&quot;Build a contact form with mock validation&quot;</span>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`ai-message max-w-[85%] rounded-xl p-4 ${
                  message.role === 'user'
                    ? 'ai-message-user bg-primary text-primary-foreground rounded-tr-none'
                    : 'ai-message-assistant bg-muted text-foreground rounded-tl-none'
                }`}
              >
                <div className="ai-message-header flex items-center gap-2 mb-2">
                  {message.role === 'user' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span className="text-xs font-medium">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                </div>
                <div className="ai-message-content whitespace-pre-wrap">
                  {message.role === 'assistant' 
                    ? renderMessageContent(message.content) 
                    : message.content}
                </div>
                {message.model && message.role === 'assistant' && (
                  <div className="ai-message-model text-xs mt-3 pt-2 border-t border-primary/20 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Generated with {message.model}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="ai-message ai-message-assistant bg-muted text-foreground rounded-xl p-4 rounded-tl-none">
              <div className="ai-message-header flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-medium">AI Assistant</span>
              </div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></div>
              </div>
              <div className="text-xs mt-2 text-foreground/70">
                Generating code... This may take up to a minute.
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="ai-chat-form flex gap-3 p-4 bg-card border-t border-border rounded-b-lg flex-col sm:flex-row">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isLoading}>
            <SelectTrigger className="ai-chat-model-select w-[200px] border border-border bg-background text-foreground focus:ring-ring focus:ring-2 rounded-lg">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border text-foreground rounded-lg">
              {FREE_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id} className="hover:bg-muted focus:bg-muted focus:text-foreground py-2 px-3 rounded-md">
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to create..."
            className="ai-chat-input-field flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground shadow-sm transition-all duration-200"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="ai-chat-send-button px-5 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md font-medium flex items-center gap-2 min-w-[100px] justify-center"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}