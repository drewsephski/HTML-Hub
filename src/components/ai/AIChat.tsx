"use client";

import { useState, useRef, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      const data = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content,
        model: data.model
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Show fallback notification if it occurred
      if (data.fallbackOccurred) {
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Note: The selected model was unavailable, so I used ${data.model} instead to generate this response.`,
          model: data.model
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
      
      // If the AI response contains HTML code, pass it to the parent
      if (data.content.includes('<!DOCTYPE html') || data.content.includes('<html')) {
        // Extract HTML content from the response
        const htmlMatch = data.content.match(/```html\s*([\s\S]*?)\s*```/);
        if (htmlMatch && htmlMatch[1]) {
          onCodeGenerated(htmlMatch[1]);
        } else {
          // If no code block found, check if the entire response is HTML
          if (data.content.trim().startsWith('<')) {
            onCodeGenerated(data.content);
          }
        }
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
      <div className="ai-chat-messages flex-1 overflow-y-auto p-4 space-y-4 bg-background rounded-lg">
        {messages.length === 0 ? (
          <div className="text-center text-foreground/70 py-8 rounded-lg bg-card border border-border h-full flex flex-col justify-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2 text-xl text-foreground">Ask me to cook!</h3>
            </div>
            <p className="text-sm mb-1">Examples:</p>
            <div className="max-w-md mx-auto text-left space-y-2 mt-3">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-sm">"Create a responsive navbar with logo and menu"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-sm">"Make a card with image, title and description"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-sm">"Build a contact form with mock validation"</span>
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
                <div className="ai-message-content whitespace-pre-wrap">{message.content}</div>
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
            placeholder="Describe the HTML you want to create..."
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
