# 🚀 HTML Hub - Instant Microtool Publishing Platform

Transform your ideas into live web tools in seconds! HTML Hub is a powerful platform that lets you create, preview, and share HTML/CSS/JavaScript snippets with AI-powered code generation and instant publishing.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

## 🌟 Why HTML Hub?

HTML Hub is designed for developers, designers, educators, and AI enthusiasts who want to quickly turn code snippets into shareable web tools. Whether you're prototyping a UI component, sharing an interactive example, or experimenting with AI-generated code, HTML Hub makes it effortless.

### Key Features

✨ **AI-Powered Code Generation** - Describe what you want to build in plain English and watch as our AI generates the HTML/CSS/JavaScript code for you

⚡ **Instant Publishing** - Go from code to a live, shareable URL with a single click

🎨 **Beautiful Dark Tech Theme** - Modern, sleek interface with glowing effects and smooth animations

🔒 **Secure Sandboxing** - All code runs in isolated iframes with strict security policies

🌐 **Public Gallery** - Discover and explore tools created by the community

📱 **Fully Responsive** - Works flawlessly on desktop, tablet, and mobile devices

## 🎥 Demo

https://github.com/user-attachments/assets/placeholder-video.mp4

*Create, generate, and publish web tools in seconds*

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun package manager
- An OpenRouter API key (for AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/drewsephski/HTML-Hub.git
   cd HTML-Hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000) to see the app in action!

## 🤖 AI Code Generation

HTML Hub features an advanced AI assistant that can generate HTML/CSS/JavaScript code from natural language descriptions:

### How It Works

1. Open the AI Code Generator panel in the editor
2. Describe what you want to create (e.g., "a responsive navbar with logo and menu")
3. The AI generates clean, modern code and automatically inserts it into the editor
4. Preview your creation instantly in the live preview pane

### Supported Models

HTML Hub supports multiple free AI models from OpenRouter:

- **GLM-4.5 Air** - Default model, optimized for code generation
- **Kimi K2** - Advanced reasoning capabilities
- **DeepSeek V3.1** - High-performance coding model
- **Gemini 2.5 Flash** - Google's multimodal model
- **Llama 3.3 70B** - Meta's powerful language model
- **Mistral Nemo** - Efficient and capable model
- **Qwen 2.5 72B** - Alibaba's advanced model
- And more...

The app automatically falls back to alternative models if the primary one is unavailable.

## 💻 Development Features

### Code Editor

- Syntax highlighting for HTML, CSS, and JavaScript
- Real-time preview with automatic updates
- Tabbed interface for organizing code
- Monaco Editor for a professional coding experience

### Publishing System

- One-click publishing to generate shareable URLs
- Automatic code validation and sanitization
- Unique tool IDs for each publication
- Public gallery for showcasing creations

### Security

- iframe sandboxing for code isolation
- Strict Content Security Policy (CSP)
- Code sanitization to prevent XSS attacks
- Rate limiting to prevent abuse

## 🎨 UI/UX Highlights

### Dark Tech Theme

Our custom dark theme features:

- Sleek dark backgrounds with vibrant accent colors
- Glowing border effects on interactive elements
- Smooth animations and transitions
- Custom scrollbar styling
- Terminal-like styling for code previews

### Responsive Design

- Works on all device sizes
- Adaptive layouts for different screen widths
- Touch-friendly controls for mobile devices
- Optimized performance across platforms

## 📚 Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── api/             # API routes
│   ├── gallery/         # Gallery page
│   ├── t/[id]/          # Tool view pages
│   └── ...              # Main editor page
├── components/          # React components
│   ├── ai/              # AI chat components
│   └── ui/              # UI components
├── lib/                 # Utility functions
└── ...
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Editor**: Monaco Editor
- **AI**: Vercel AI SDK, OpenRouter API
- **Deployment**: Vercel
- **Database**: (To be implemented)

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your GitHub repository
4. Set environment variables in the Vercel dashboard
5. Deploy!

### Other Platforms

HTML Hub can be deployed to any platform that supports Next.js, including:
- Netlify
- AWS Amplify
- Firebase Hosting
- DigitalOcean App Platform

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📖 Documentation

For more detailed information about specific features, check out our documentation:

- [AI Integration Guide](docs/ai-integration.md)
- [UI Component Library](docs/components.md)
- [API Documentation](docs/api.md)
- [Security Guidelines](docs/security.md)

## 🙋 Support

Need help? Have questions? 

- Check our [FAQ](FAQ.md)
- Open an issue on GitHub
- Contact us at support@htmlhub.dev

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the amazing framework
- [OpenRouter](https://openrouter.ai) for AI model access
- [Shadcn UI](https://ui.shadcn.com) for beautiful components
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- All the open-source projects that made this possible

---

<p align="center">
  Made with ❤️ by the HTML Hub Team
  <br/>
  <a href="https://github.com/drewsephski/HTML-Hub">GitHub</a> • 
  <a href="https://htmlhub.dev">Website</a> • 
  <a href="https://twitter.com/htmlhub">Twitter</a>
</p>