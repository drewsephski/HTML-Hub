import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
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

async function tryGenerateText(openrouter: any, messages: any[], modelInfo: { id: string, name: string }) {
  try {
    console.log(`Trying model: ${modelInfo.id}`);
    const model = openrouter(modelInfo.id);
    
    const result = await generateText({
      model,
      messages,
      // Add parameters to reduce token usage
      maxTokens: 1500, // Limit response length
      temperature: 0.7, // Add some creativity but not too much
      // Add timeout for individual model requests (50 seconds)
      timeout: 50000
    });
    
    return {
      success: true,
      result,
      model: modelInfo.name
    };
  } catch (error) {
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
        content: `You are an expert HTML/CSS/JavaScript developer. Generate clean, modern, responsive HTML code.
Key rules:
1. Use semantic HTML5
2. Responsive with CSS Flexbox/Grid
3. Self-contained single HTML file
4. Wrap code in \`\`\`html \`\`\` blocks
5. Keep it simple and focused`
      },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }))
    ];

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

    console.log('Received response from OpenRouter API');
    console.log('Response length:', finalResult.text.length);

    return NextResponse.json({ 
      content: finalResult.text,
      model: finalModelName,
      fallbackOccurred: fallbackOccurred
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