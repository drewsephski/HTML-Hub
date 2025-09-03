import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

// Allow responses up to 55 seconds (less than frontend timeout)
export const maxDuration = 55;

// List of free models from OpenRouter
const FREE_MODELS = [
  { id: 'z-ai/glm-4.5-air:free', name: 'GLM-4.5 Air' },
  { id: 'moonshotai/kimi-k2:free', name: 'Kimi K2' },
  { id: 'deepseek/deepseek-chat-v3.1:free', name: 'DeepSeek V3.1' },
  { id: 'google/gemini-2.5-flash-image-preview:free', name: 'Gemini 2.5 Flash' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B' },
  { id: 'mistralai/mistral-nemo:free', name: 'Mistral Nemo' },
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B' },
  { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1' },
  { id: 'mistralai/mistral-small-24b-instruct-2501:free', name: 'Mistral Small 3' },
  { id: 'openai/gpt-oss-20b:free', name: 'GPT OSS 20B' }
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
      // Add timeout for individual model requests
      timeout: 50000 // 50 seconds
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
    
    // If a specific model is selected, try that first
    if (selectedModelId) {
      const selectedModel = FREE_MODELS.find(model => model.id === selectedModelId);
      if (selectedModel) {
        const result = await tryGenerateText(openrouter, fullMessages, selectedModel);
        if (result.success) {
          finalResult = result.result;
          finalModelName = result.model;
        }
      }
    }
    
    // If no specific model was selected or it failed, try models in order until one works
    if (!finalResult) {
      for (const modelInfo of FREE_MODELS) {
        const result = await tryGenerateText(openrouter, fullMessages, modelInfo);
        if (result.success) {
          finalResult = result.result;
          finalModelName = result.model;
          break;
        }
        // Add a small delay between retry attempts
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
      model: finalModelName
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