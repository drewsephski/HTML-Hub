import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, LanguageModel } from 'ai';
import { NextResponse } from 'next/server';

// Allow responses up to 55 seconds (slightly less than frontend timeout)
export const maxDuration = 55;

// List of free models from OpenRouter (reliable models only in specified order)
const FREE_MODELS = [
  { id: 'moonshotai/kimi-k2:free', name: 'Kimi K2' },
  { id: 'z-ai/glm-4.5-air:free', name: 'GLM-4.5 Air' },
  { id: 'deepseek/deepseek-chat-v3.1:free', name: 'DeepSeek V3.1' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B' }
];

interface ModelResult {
  success: boolean;
  result?: any;
  error?: any;
  model: string;
}

async function tryGenerateText(openrouter: (modelId: string) => LanguageModel, messages: any[], modelInfo: { id: string, name: string }) {
  try {
    console.log(`Trying model: ${modelInfo.id}`);
    const model = openrouter(modelInfo.id);
    
    // Use streamText for streaming responses
    const result = await streamText({
      model,
      messages
    });
    
    return {
      success: true,
      result,
      model: modelInfo.name
    };
  } catch (error: any) {
    console.error(`Error with model ${modelInfo.id}:`, error.message);
    return {
      success: false,
      error,
      model: modelInfo.name
    };
  }
}

export async function POST(req: Request) {
  console.log('AI Chat API called');
  
  try {
    const { messages, model: selectedModelId } = await req.json();
    console.log('Received messages:', messages.length);
    console.log('Selected model:', selectedModelId);
    
    // Get the API key from environment variables
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log('API key present:', !!apiKey);
    
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY is not set' },
        { status: 500 }
      );
    }

    // Create the OpenRouter provider with the API key
    console.log('Creating OpenRouter provider');
    const openrouter = createOpenRouter({ 
      apiKey
    });
    
    // Prepare messages with system prompt
    const fullMessages = [
      {
        role: 'system',
        content: `You are an expert frontend developer specializing in modern web technologies. Your task is to generate high-quality, production-ready HTML/CSS/JavaScript code that follows current best practices.

Key Requirements:
1. Use semantic HTML5 with proper document structure
2. Implement responsive design using CSS Flexbox and Grid
3. Create self-contained, single HTML files that work independently
4. Wrap all code in \`\`\`html \`\`\` blocks
5. Prioritize clean, maintainable, and well-commented code

Modern Development Practices:
- Use standard CSS for styling (no Tailwind CSS or other utility-first frameworks)
- Implement responsive design that works on mobile, tablet, and desktop
- Use modern CSS features like Flexbox, Grid, custom properties (CSS variables), and animations
- Follow accessibility best practices (ARIA attributes, semantic tags)
- Include performance optimizations (minimize assets, efficient code)

CSS Styling Guidelines:
- Use standard CSS instead of utility classes
- Implement a consistent design system with a cohesive color palette
- Use CSS custom properties (variables) for consistent theming
- Create responsive layouts using Flexbox and Grid
- Implement mobile-first responsive design with appropriate media queries
- Use modern CSS features like clamp() for fluid typography and spacing
- Include smooth transitions and animations for enhanced user experience
- Follow a mobile-first approach with min-width media queries for larger screens

Code Structure:
- Always include a complete HTML document with proper DOCTYPE
- Place all CSS styling in a <style> tag within the <head>
- Include any necessary JavaScript before the closing </body> tag
- Use modern JavaScript (ES6+) features when appropriate
- Add meaningful comments to explain complex functionality
- Ensure all code is properly indented and formatted

Design System Guidelines:
- Use a consistent color palette with primary, secondary, and accent colors
- Implement proper spacing using a consistent scale (e.g., 4px, 8px, 12px, 16px, 24px, 32px)
- Use a clear typography hierarchy with appropriate font sizes and weights
- Ensure proper contrast for accessibility (minimum 4.5:1 for normal text)
- Implement consistent button styles, form elements, and interactive components
- Create visual hierarchy through size, color, and spacing
- Use consistent border-radius values for rounded elements
- Implement consistent hover, focus, and active states for interactive elements

Example Output Format:
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
  <style>
    /* CSS variables for consistent theming */
    :root {
      --primary-color: #3b82f6;
      --secondary-color: #64748b;
      --background-color: #ffffff;
      --text-color: #1e293b;
      --border-color: #cbd5e1;
      --success-color: #10b981;
      --warning-color: #f59e0b;
      --danger-color: #ef4444;
      
      /* Spacing scale */
      --space-xs: 0.25rem;
      --space-sm: 0.5rem;
      --space-md: 1rem;
      --space-lg: 1.5rem;
      --space-xl: 2rem;
      --space-xxl: 3rem;
      
      /* Typography scale */
      --font-size-sm: 0.875rem;
      --font-size-base: 1rem;
      --font-size-lg: 1.125rem;
      --font-size-xl: 1.25rem;
      --font-size-xxl: 1.5rem;
      --font-size-xxxl: 2rem;
      
      /* Border radius */
      --border-radius-sm: 0.25rem;
      --border-radius-md: 0.5rem;
      --border-radius-lg: 0.75rem;
    }
    
    /* Dark mode variables */
    @media (prefers-color-scheme: dark) {
      :root {
        --background-color: #0f172a;
        --text-color: #f1f5f9;
        --border-color: #334155;
      }
    }
    
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: var(--background-color);
      color: var(--text-color);
      line-height: 1.6;
    }
    
    /* Component styles */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--space-lg);
    }
    
    .btn {
      display: inline-block;
      padding: var(--space-sm) var(--space-md);
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius-md);
      cursor: pointer;
      font-size: var(--font-size-base);
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .btn:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .container {
        padding: 0 var(--space-md);
      }
    }
  </style>
</head>
<body>
  <!-- Your content here -->
  <script>
    // Your JavaScript here
  </script>
</body>
</html>
\`\`\`

Focus on creating visually appealing, functional, and modern web components that showcase the power of standard CSS and contemporary web development practices. Prioritize consistency in design, responsive behavior, and accessibility.`
      },
      ...messages
    ];

    // Try streaming first
    let finalResult: any = null;
    let finalModelName: string = '';
    let fallbackOccurred = false;
    
    // If a specific model is selected, try that first
    if (selectedModelId) {
      const selectedModel = FREE_MODELS.find(model => model.id === selectedModelId);
      if (selectedModel) {
        const result = await tryGenerateText(openrouter, fullMessages, selectedModel);
        if (result.success) {
          finalResult = result.result;
          finalModelName = result.model;
        } else {
          // Fallback occurred
          fallbackOccurred = true;
        }
      }
    }
    
    // If no specific model was selected or it failed, try models in order until one works
    if (!finalResult) {
      for (const modelInfo of FREE_MODELS) {
        // Skip the selected model if we already tried it
        if (selectedModelId === modelInfo.id && !fallbackOccurred) {
          continue;
        }
        
        const result = await tryGenerateText(openrouter, fullMessages, modelInfo);
        if (result.success) {
          finalResult = result.result;
          finalModelName = result.model;
          // Set fallback occurred if we're using a different model than selected
          if (selectedModelId && selectedModelId !== modelInfo.id) {
            fallbackOccurred = true;
          }
          break;
        }
        // Add a 1-second delay between retry attempts to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // If all models failed, return the error from the first model
    if (!finalResult) {
      const firstModelResult = await tryGenerateText(openrouter, fullMessages, FREE_MODELS[0]);
      throw firstModelResult.error;
    }

    console.log('Streaming response from OpenRouter API');
    
    // Convert the stream to a ReadableStream for the response
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          // Stream the text response
          for await (const chunk of finalResult.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('Error streaming response:', error);
        } finally {
          controller.close();
        }
      }
    });
    
    // Return a streaming response with proper headers
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Model-Used': finalModelName,
        'X-Fallback-Occurred': fallbackOccurred.toString(),
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    // Check if it's a network error
    if (error.message && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Network error: Unable to connect to OpenRouter API. Please check your internet connection.' },
        { status: 500 }
      );
    }
    
    // Check if it's an authentication error
    if (error.message && error.message.includes('auth')) {
      return NextResponse.json(
        { error: 'Authentication error: Invalid or missing API key.' },
        { status: 500 }
      );
    }
    
    // Check if it's a timeout error
    if (error.message && (error.message.includes('timeout') || error.message.includes('aborted'))) {
      return NextResponse.json(
        { error: 'Request timeout: The AI service is taking longer than expected to respond. This might be due to high demand. Please try again with a simpler request.' },
        { status: 500 }
      );
    }
    
    // Check if it's a credit error
    if (error.message && error.message.includes('credits')) {
      return NextResponse.json(
        { error: 'Insufficient credits: Your OpenRouter account has run out of credits. Please visit https://openrouter.ai/settings/credits to add more credits.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process AI request: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}