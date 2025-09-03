# 🚀 HTML Hub - Instant Microtool Publishing Platform

## 📋 PRD Summary

**Product**: HTML Hub – The fastest way to turn AI-generated HTML/JS/CSS into live, shareable web tools.

**Vision**: Empower creators to instantly publish and share interactive web tools without any setup, hosting, or backend knowledge.

**Target Users**:

- Developers prototyping UI components
- AI enthusiasts sharing AI-generated tools
- Educators creating interactive examples
- Hobbyists building mini web apps

**Core Value Proposition**:

- ⚡ Instant publishing with one click
- 🔒 Secure sandboxing for all code
- 🌐 Public gallery for discovery
- 🎨 Fun, engaging user experience
- 🤖 AI-powered code generation

## 🎯 MVP Core Features

### Core Functionality

- [x] **Code Paste & Preview**
  - Large, syntax-highlighted editor
  - Live iFrame preview
  - Support for HTML, CSS, and JavaScript

- [x] **Instant Publishing**
  - One-click URL generation
  - Automatic code validation
  - Unique, shareable links

- [x] **Tool Gallery**
  - Grid of recent publications
  - Hover previews
  - Basic search/filter (Phase 2)

### User Experience

- [x] **Sandbox Security**
  - iFrame isolation
  - Strict CSP policies
  - Code sanitization

- [x] **Sharing**
  - Copy link button
  - Social media sharing
  - Embed codes

- [x] **Fun Elements**
  - Playful animations
  - Success microinteractions
  - Mascot/character

- [x] **AI Code Generation**
  - Natural language to HTML/CSS/JS conversion
  - Powered by GLM-4.5 Air model via OpenRouter
  - Real-time code generation and insertion
  - Fallback models for reliability

- [x] **Enhanced UI/UX**
  - Modern dark tech theme
  - Glowing border effects
  - Smooth animations and transitions
  - Improved code editor experience
  - Enhanced AI chat interface

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + Shadcn UI
- **State**: React Context + useReducer
- **Code Editor**: Monaco Editor
- **Animations**: Framer Motion
- **AI Integration**: Vercel AI SDK + OpenRouter

### Backend

- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth.js (Phase 2)
- **Storage**: Vercel Blob Storage

### Security

- **Sandboxing**: iframe sandbox attributes
- **CSP**: Strict Content Security Policy
- **Rate Limiting**: Vercel Edge Middleware

## 📱 Page Flows

### 1. Home / Editor Page (`/`)

```
┌─────────────────────────────────────┐
│  +----------------------------+    │
│  |      HTML Hub Logo         |    │
│  +----------------------------+    │
│                                   │
│  [Tabs: HTML | CSS | JavaScript]  │
│  +----------------------------+    │
│  | // Your code here...       |    │
│  |                            |    │
│  |                            |    │
│  +----------------------------+    │
│                                   │
│  [Preview] [Publish] [Clear]      │
│                                   │
│  +----------------------------+   │
│  | Live Preview (iFrame)      |   │
│  |                            |   │
│  +----------------------------+   │
│                                   │
│  [AI Code Generator Panel]        │
│  +----------------------------+   │
│  | Chat with AI to generate   |   │
│  | code. Generated code is    |   │
│  | automatically inserted.    |   │
│  +----------------------------+   │
└─────────────────────────────────────┘
```

### 2. Tool Page (`/t/[id]`)

```
┌─────────────────────────────────────┐
│  +----------------------------+    │
│  | Tool Title                🔗📋  │
│  +----------------------------+    │
│  [Preview] [Code] [Fork]            │
│  +----------------------------+    │
│  | Live Tool (iFrame)         |    │
│  |                            |    │
│  +----------------------------+    │
│  Created: [timestamp] by [user]    │
└─────────────────────────────────────┘
```

### 3. Gallery Page (`/gallery`)

```
┌─────────────────────────────────────┐
│  +------------------------+         │
│  |    🔍 Search...       |  Sort:  │
│  +------------------------+  Newest ▼│
│                                   │
│  ┌───────┐  ┌───────┐  ┌───────┐  │
│  │ Tool  │  │ Tool  │  │ Tool  │  │
│  │ Prev  │  │ Prev  │  │ Prev  │  │
│  └───────┘  └───────┘  └───────┘  │
│                                   │
│  ┌───────┐  ┌───────┐  ┌───────┐  │
│  │ Tool  │  │ Tool  │  │ Tool  │  │
│  │ Prev  │  │ Prev  │  │ Prev  │  │
│  └───────┘  └───────┘  └───────┘  │
│                                   │
│  [Load More]                      │
└─────────────────────────────────────┘
```

## 📅 5-Day MVP Timeline

### Day 1: Foundation & Setup

- [x] Initialize Next.js 15 project with TypeScript
- [x] Set up Tailwind CSS and Shadcn UI
- [x] Configure Vercel deployment
- [x] Set up Supabase project and database
- [x] Create basic layout and navigation
- [x] Implement code editor component

### Day 2: Core Functionality

- [x] Implement iFrame sandbox with CSP
- [x] Create tabbed editor interface
- [x] Add live preview functionality
- [x] Implement basic error handling
- [x] Add copy/paste functionality

### Day 3: Publishing & Sharing

- [x] Set up database schema for tools
- [x] Implement save functionality
- [x] Create unique URL generation
- [x] Build tool view page
- [x] Add copy link functionality

### Day 4: Gallery & Discovery

- [x] Create gallery page layout
- [x] Implement tool cards with previews
- [x] Add pagination
- [x] Create search functionality
- [x] Add sorting options

### Day 5: Polish & Launch

- [x] Add loading states and error boundaries
- [x] Implement responsive design
- [x] Add fun microinteractions
- [x] Set up analytics
- [x] Deploy to production
- [x] Add AI code generation feature
- [x] Enhance UI/UX with dark tech theme

## 🚀 Launch Strategy

### Technical Preparation

- [x] Set up custom domain
- [x] Configure SSL
- [x] Implement backup system
- [x] Set up monitoring

### Marketing & Growth

1. **Content Marketing**
   - Create tutorial videos
   - Write blog posts about use cases
   - Share templates and examples

2. **Community Building**
   - Launch on Product Hunt
   - Share on Dev.to and Hashnode
   - Create Twitter/X threads

3. **Growth Hacks**
   - Add "Made with HTML Hub" badge
   - Implement referral system
   - Create template marketplace (Phase 2)

## 📈 Success Metrics

### Primary KPIs

- Number of tools created
- Active users
- Average session duration
- Shares per tool

### Technical Metrics

- API response time
- Error rates
- Uptime

## 🔮 Future Roadmap

### Phase 2 (1-2 months)

- User accounts and profiles
- Comments and likes
- Collections and folders
- GitHub integration

### Phase 3 (3-4 months)

- Teams and collaboration
- Version history
- Custom domains
- API access

## 🛡️ Security & Privacy

### Data Protection

- All pastes encrypted at rest
- Regular security audits
- Data retention policy

### User Controls

- Private/public tools
- Password protection
- Report/flag system

## 🙋 FAQ

**Q: Is there a file size limit?**
A: Initial limit of 1MB per tool.

**Q: Can I use external libraries?**
A: Yes, via CDN links in the HTML head.

**Q: How long do tools stay active?**
A: Currently indefinite, but may implement cleanup of unused tools in the future.

**Q: How does the AI code generation work?**
A: We use the GLM-4.5 Air model from OpenRouter to convert your natural language descriptions into clean HTML/CSS/JavaScript code. The generated code is automatically inserted into the editor. If the primary model is unavailable, we automatically fallback to other models like Kimi K2 or GPT-3.5 Turbo.

---

*HTML Hub - Where ideas become live tools in seconds!* 🚀