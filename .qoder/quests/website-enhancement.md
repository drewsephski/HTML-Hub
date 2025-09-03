# Website Enhancement Design Document

## 1. Overview

This document outlines the enhancements to the HTML Hub website to improve functionality, UI/UX consistency, and reliability. The enhancements will leverage all CSS variables and styles from `globals.css` for a consistent design, and will focus on making the app more robust by using only reliable AI models such as Kimi K2.

## 2. Architecture

The HTML Hub is a Next.js 15 application using the App Router architecture with React 19. The application consists of:
- A main editor page with HTML/CSS/JS editors and live preview
- An AI chat component for code generation
- A gallery page for browsing published tools
- Individual tool pages for viewing published tools
- API routes for tool management and AI integration

The enhancements will maintain this architecture while improving the UI consistency and AI reliability.

## 3. UI/UX Enhancements

### 3.1 Consistent Design System

All components will be updated to use CSS variables from `globals.css` for consistent styling:

#### Color Palette
- Primary: `var(--primary)` with `var(--primary-foreground)` for text
- Secondary: `var(--secondary)` with `var(--secondary-foreground)` for text
- Accent: `var(--accent)` with `var(--accent-foreground)` for text
- Background: `var(--background)` with `var(--foreground)` for text
- Card: `var(--card)` with `var(--card-foreground)` for text
- Muted: `var(--muted)` with `var(--muted-foreground)` for text
- Border: `var(--border)`
- Ring: `var(--ring)`
- Destructive: `var(--destructive)` with `var(--destructive-foreground)` for text
- Input: `var(--input)` for form elements
- Popover: `var(--popover)` with `var(--popover-foreground)` for text

#### Typography
- Font family: `var(--font-sans)` for general text
- Monospace font: `var(--font-mono)` for code editors
- Serif font: `var(--font-serif)` for headings (when appropriate)
- Font sizes and weights will follow Tailwind's default scale

#### Spacing and Radius
- Border radius: `var(--radius)` for consistent rounded corners
- Padding and margin using `var(--spacing)` multiples
- Letter spacing: `var(--tracking-normal)` for consistent text spacing

#### Shadows
- Shadow color: `var(--shadow-color)`
- Shadow opacity: `var(--shadow-opacity)`
- Shadow sizes: `var(--shadow-xs)` through `var(--shadow-2xl)`

#### Chart Colors
- Chart colors 1-5: `var(--chart-1)` through `var(--chart-5)` for data visualization

#### Sidebar Colors
- Sidebar: `var(--sidebar)` with `var(--sidebar-foreground)` for text
- Sidebar primary: `var(--sidebar-primary)` with `var(--sidebar-primary-foreground)` for text
- Sidebar accent: `var(--sidebar-accent)` with `var(--sidebar-accent-foreground)` for text
- Sidebar border: `var(--sidebar-border)`
- Sidebar ring: `var(--sidebar-ring)`

### 3.2 Component Enhancements

#### Navigation
- Enhanced styling using CSS variables
- Improved hover states and active states
- Better responsive behavior

#### Editor Components
- Consistent styling with card components using `var(--card)` background
- Improved tab navigation with `var(--primary)` indicator
- Enhanced border styling with `var(--border)` and glow effects

#### AI Chat Interface
- Improved message bubbles using `var(--primary)` and `var(--muted)` backgrounds
- Better input styling with consistent focus states using `var(--ring)`
- Enhanced loading indicators

#### Gallery and Tool Pages
- Consistent card styling for tool items
- Improved search functionality
- Better responsive layouts

#### Buttons and Interactive Elements
- Primary buttons using `var(--primary)` background with `var(--primary-foreground)` text
- Secondary buttons using `var(--secondary)` background with `var(--secondary-foreground)` text
- Destructive buttons using `var(--destructive)` background with `var(--destructive-foreground)` text
- Consistent hover states with appropriate opacity changes
- Focus states using `var(--ring)` color

#### Forms and Inputs
- Consistent styling using `var(--input)` background and `var(--foreground)` text
- Border styling with `var(--border)` color
- Focus states with `var(--ring)` color and shadow
- Proper spacing and padding using `var(--spacing)` variables

## 4. AI Integration Improvements

### 4.1 Model Selection

The AI integration will be updated to focus on reliable models:

#### Primary Model
- Kimi K2 (`moonshotai/kimi-k2:free`) will be set as the default model

#### Model Selection Strategy
- Remove less reliable models from the selection list
- Maintain only proven models in this specific order:
  1. Kimi K2 (`moonshotai/kimi-k2:free`) - default and primary model
  2. GLM-4.5 Air (`z-ai/glm-4.5-air:free`)
  3. DeepSeek V3.1 (`deepseek/deepseek-chat-v3.1:free`)
  4. Llama 3.3 70B (`meta-llama/llama-3.3-70b-instruct:free`)

Models to be removed due to reliability issues:
- Google Gemini 2.5 Flash
- Mistral Nemo
- Qwen 2.5 72B
- Mistral 7B
- Llama 3.2 3B
- Gemma 2 9B

### 4.2 Error Handling and Reliability

#### Timeout Management
- Frontend timeout: 60 seconds
- Backend timeout: 55 seconds (slightly less than frontend to prevent race conditions)
- Model-specific timeout: 50 seconds for individual model requests

#### Error Handling
- Network error detection and user-friendly messages
- Authentication error handling
- Timeout error handling with retry suggestions
- Model-specific error handling
- Credit/billing error handling for API usage limits

#### Fallback Mechanism
- Automatic fallback to alternative models when primary model fails
- Sequential model attempts with Kimi K2 as first priority
- 1-second delay between retry attempts to prevent rate limiting
- Clear user notification when fallback occurs

### 4.3 Response Processing

#### Code Extraction
- Enhanced regex patterns for extracting HTML code from AI responses
- Better handling of edge cases where code isn't properly formatted
- Fallback to using entire response if it appears to be HTML

#### Content Validation
- Basic validation of generated HTML to prevent malformed code
- Size limits to prevent extremely large responses from causing performance issues
- Sanitization of potentially harmful code (while maintaining functionality)

## 5. Data Flow and State Management

### 5.1 Editor State Management
- HTML/CSS/JS code state managed with React useState
- Debounced preview updates for better performance
- Proper cleanup of timeouts with useEffect

### 5.2 AI Chat State Management
- Message history management
- Loading states for better UX
- Model selection state
- Error state handling

### 5.3 Tool Data Flow
- API communication for tool creation and retrieval
- In-memory storage for demonstration purposes
- Proper error handling for API failures

## 6. API Endpoints

### 6.1 AI Chat Endpoint
```
POST /api/ai/chat
Content-Type: application/json

{
  "messages": [...],
  "model": "moonshotai/kimi-k2:free"
}
```

Response:
```json
{
  "content": "Generated code...",
  "model": "Kimi K2"
}
```

### 6.2 Tools Management Endpoints
- GET /api/tools - Retrieve all tools
- POST /api/tools - Create a new tool
- GET /api/tools/[id] - Retrieve a specific tool

## 7. Security Considerations

- Content Security Policy for iframe sandboxing
- Input validation for tool creation
- Proper error handling to prevent information leakage
- Secure API key handling through environment variables
- Rate limiting for API endpoints to prevent abuse

## 8. Performance Optimizations

- Debounced preview updates to reduce rendering overhead
- Efficient message rendering in AI chat
- Proper cleanup of event listeners and timeouts
- Optimized API calls with error handling
- Code splitting for faster initial loading
- Image optimization for any static assets

## 9. Testing Strategy

### 9.1 Unit Testing
- Component rendering tests
- State management tests
- API route tests

### 9.2 Integration Testing
- Editor functionality with live preview
- AI chat integration
- Tool creation and retrieval flows

### 9.3 UI Testing
- Responsive design across device sizes
- Color scheme consistency
- Interactive element behavior
- Accessibility compliance

## 10. Implementation Plan

### 10.1 Phase 1: UI/UX Enhancements
- Update all components to use CSS variables consistently
- Implement improved styling for all pages
- Enhance navigation and interactive elements

### 10.2 Phase 2: AI Integration Improvements
- Update model selection to prioritize Kimi K2
- Remove unreliable models
- Implement enhanced error handling
- Add fallback mechanisms

### 10.3 Phase 3: Testing and Optimization
- Comprehensive testing of all features
- Performance optimization
- Accessibility improvements
- Final validation

## 11. Rollout Strategy

1. Develop enhancements in feature branches
2. Conduct thorough testing in development environment
3. Deploy to staging environment for review
4. Gradual rollout to production with monitoring
5. Monitor for issues and gather user feedback