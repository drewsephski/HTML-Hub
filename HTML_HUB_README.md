# 🚀 HTML Hub - Instant Microtool Publishing Platform

Transform your ideas into live web tools in seconds! HTML Hub is a powerful platform that lets you create, preview, and share HTML/CSS/JavaScript snippets with AI-powered code generation and instant publishing.

## 🌟 What is HTML Hub?

HTML Hub is designed for developers, designers, educators, and AI enthusiasts who want to quickly turn code snippets into shareable web tools. Whether you're prototyping a UI component, sharing an interactive example, or experimenting with AI-generated code, HTML Hub makes it effortless.

## 🎯 Core Features

### 💻 Code Editor & Preview
- **Multi-tab Editor**: Separate tabs for HTML, CSS, and JavaScript
- **Real-time Preview**: Instantly see changes in the live preview pane
- **Syntax Highlighting**: Professional code editing experience with Monaco Editor
- **Responsive Design**: Works flawlessly on all device sizes

### 🤖 AI Code Generation
- **Natural Language to Code**: Describe what you want to build and let AI generate the code
- **Multiple AI Models**: Choose from 10+ free models including GLM-4.5 Air, Kimi K2, Llama 3.3, and more
- **Automatic Code Insertion**: Generated code is automatically placed in the correct editor tabs
- **Model Fallback**: If one model is unavailable, we automatically try others

### ⚡ Instant Publishing
- **One-click Publishing**: Generate a shareable URL with a single click
- **Unique Tool IDs**: Each publication gets its own permanent URL
- **Public Gallery**: Showcase your creations in our community gallery
- **Easy Sharing**: Copy links or share directly on social media

### 🎨 Enhanced UI/UX
- **Dark Tech Theme**: Modern dark interface with vibrant accent colors
- **Glowing Effects**: Visual elements with subtle glowing borders
- **Smooth Animations**: Polished transitions and micro-interactions
- **Responsive Layout**: Adapts to any screen size

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm, yarn, pnpm, or bun package manager
- An OpenRouter API key (for AI features)

### Quick Setup
1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env.local` file with your OpenRouter API key
4. Run `npm run dev` and visit `http://localhost:3000`

## 🤖 AI Models

HTML Hub supports multiple free AI models from OpenRouter:

- **GLM-4.5 Air** - Default model, optimized for code generation
- **Kimi K2** - Advanced reasoning capabilities
- **DeepSeek V3.1** - High-performance coding model
- **Gemini 2.5 Flash** - Google's multimodal model
- **Llama 3.3 70B** - Meta's powerful language model
- **Mistral Nemo** - Efficient and capable model
- **Qwen 2.5 72B** - Alibaba's advanced model
- **Mistral 7B** - Lightweight but effective model
- **Llama 3.2 3B** - Compact Meta model
- **Gemma 2 9B** - Google's efficient model

The app automatically falls back to alternative models if the primary one is unavailable.

## 🛡️ Security Features

- **iframe Sandboxing**: All code runs in isolated environments
- **Content Security Policy**: Strict policies to prevent XSS attacks
- **Code Sanitization**: Automatic cleaning of potentially harmful code
- **Rate Limiting**: Protection against abuse

## 📱 User Interface

### Editor Page
The main editor page features:
- Tabbed interface for HTML/CSS/JavaScript
- Large code editor with syntax highlighting
- Real-time preview pane
- AI Code Generator panel
- Publishing controls

### Gallery Page
- Grid layout of published tools
- Hover previews of tools
- Sorting and filtering options
- Easy navigation between tools

### Tool View Page
- Full-screen preview of published tools
- Code viewing option
- Sharing controls
- Creation timestamp

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Editor**: Monaco Editor
- **AI**: Vercel AI SDK, OpenRouter API
- **Deployment**: Vercel

## 📈 Use Cases

- **Prototyping**: Quickly build and test UI components
- **Education**: Create interactive examples for students
- **Sharing**: Share code snippets with colleagues or the community
- **AI Experimentation**: Test different AI models for code generation
- **Mini Projects**: Build small web apps without setup overhead

## 🤝 Contributing

We welcome contributions of all kinds! Here's how you can help:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Check out our [contribution guidelines](CONTRIBUTING.md) for more details.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by the HTML Hub Team<br/>
  Turn your ideas into live tools in seconds!
</p>
