This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## AI Code Generation Feature

This project includes an AI-powered code generation feature that uses the GLM-4.5 Air model from OpenRouter to generate HTML/CSS/JavaScript code based on natural language descriptions.

To use this feature, you need to:

1. Sign up for an account at [OpenRouter](https://openrouter.ai/)
2. Get your API key from the dashboard
3. Create a `.env.local` file in the root of the project
4. Add your API key to the file:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Once configured, you can access the AI assistant through the "AI Code Generator" panel on the main page.

The AI feature:
- Uses the GLM-4.5 Air model by default (free tier)
- Has fallback models (Kimi K2, GPT-3.5 Turbo) if the primary model is unavailable
- Automatically parses generated HTML code and inserts it into the editor
- Includes proper error handling and timeout management
- Works with responsive design prompts

## Enhanced UI/UX

The application now features a modern dark tech theme with:

- Sleek dark mode interface with vibrant accent colors
- Glowing border effects on interactive elements
- Smooth animations and transitions
- Improved code editor with syntax highlighting
- Enhanced AI chat interface with better message styling
- Responsive design that works on all device sizes
- Custom scrollbar styling
- Terminal-like styling for code previews

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.