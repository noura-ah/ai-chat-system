# AI Chat System with Search

A full-stack AI chat application similar to ChatGPT with Google OAuth authentication, streaming responses, integrated web search capabilities, and persistent chat history.

## Features

- 🤖 **AI Chat**: Real-time streaming chat responses using OpenRouter (supports multiple AI models)
- 🔍 **Web Search**: Integrated search functionality with image results and horizontal scrolling
- 🔐 **Google OAuth**: Secure authentication with Google Single Sign-On
- 💾 **Chat History**: Persistent conversation history with PostgreSQL database
- 📝 **Markdown Support**: Rich markdown rendering with syntax highlighting for code blocks
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- 📱 **Responsive Design**: Works seamlessly on mobile and desktop
- ⚡ **Streaming Responses**: Real-time AI response streaming with stop button
- 🖼️ **Image Results**: Display images from search results with horizontal scrolling
- 💬 **Conversation Management**: Sidebar with conversation list, create, delete, and navigate
- 🎯 **Mode Persistence**: Chat/search mode saved per conversation
- 🔄 **Optimistic UI**: Instant UI updates with background sync

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with Google OAuth
- **AI Provider**: OpenRouter (supports OpenAI, Anthropic, and other models)
- **Search API**: SerpAPI
- **Database**: PostgreSQL with Prisma ORM
- **Markdown**: react-markdown with remark-gfm and syntax highlighting

## Prerequisites

- **Node.js** 18+ and npm/yarn
- **PostgreSQL** database (for chat history persistence)
- **Google OAuth** credentials (Client ID and Secret)
- **OpenRouter** API key
- **SerpAPI** key (for web search)

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd AI_chat_system_with_search
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenRouter API
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openai/gpt-4o-mini  # Optional: defaults to openai/gpt-4o-mini
OPENROUTER_REFERER_URL=https://your-domain.com  # Optional: for tracking
OPENROUTER_APP_NAME=AI Chat System  # Optional: app name for tracking

# Search API
SERPAPI_KEY=your-serpapi-key

# Database (Required for chat history)
DATABASE_URL=postgresql://user:password@localhost:5432/ai_chat?schema=public
```

### 4. Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Copy the output and add it to your `.env.local` file as `NEXTAUTH_SECRET`.

### 5. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or use migrations (production)
npm run db:migrate
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Configuration

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Select a project" → "New Project"
   - Enter a project name and click "Create"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in app name, user support email, and developer contact`
   - Add test users if needed (for development)
   - Save and continue

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "AI Chat System" (or your preferred name)
   - Authorized redirect URIs:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://your-domain.com/api/auth/callback/google`
   - Click "Create"

5. **Copy Credentials**
   - Copy the Client ID and Client Secret
   - Add them to your `.env.local` file

### OpenRouter API Setup

1. **Create an Account**
   - Visit [OpenRouter.ai](https://openrouter.ai/)
   - Sign up for an account

2. **Get API Key**
   - Go to [Keys](https://openrouter.ai/keys)
   - Click "Create Key"
   - Copy your API key

3. **Configure Privacy Settings**
   - Go to [Privacy Settings](https://openrouter.ai/settings/privacy)
   - Enable the models you want to use
   - Configure data policy settings

4. **Add to Environment Variables**
   - Add `OPENROUTER_API_KEY` to your `.env.local`
   - Optionally set `OPENROUTER_MODEL` (defaults to `openai/gpt-4o-mini`)

**Supported Models:**
- `openai/gpt-4o-mini` (default, cost-effective)
- `openai/gpt-4o`
- `anthropic/claude-3-haiku`
- `anthropic/claude-3-sonnet`
- And many more via OpenRouter

### SerpAPI Setup

1. **Create an Account**
   - Visit [SerpAPI](https://serpapi.com/)
   - Sign up for an account

2. **Get API Key**
   - Go to your dashboard
   - Copy your API key

3. **Add to Environment Variables**
   - Add `SERPAPI_KEY` to your `.env.local`

**Note:** SerpAPI offers a free tier with limited requests. For production, consider upgrading your plan.

## Database Setup

### Local Development

For local development, you can use a local PostgreSQL database or a cloud database for testing.

1. **Set up PostgreSQL locally** (optional)
   ```bash
   # macOS (using Homebrew)
   brew install postgresql
   brew services start postgresql
   createdb ai_chat
   ```

2. **Or use a cloud database** (recommended for testing)
   - **Supabase** (Free tier): [supabase.com](https://supabase.com/)
   - **Neon** (Free tier): [neon.tech](https://neon.tech/)
   
   Copy the connection string and add it to your `.env.local`:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
   ```

3. **Initialize Database Schema**
   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Push schema (development - auto-creates tables)
   npm run db:push
   ```

### Production (Vercel with Prisma)

When deploying to Vercel, you can use Vercel Postgres or any PostgreSQL database:

1. **Using Vercel Postgres** (Optional)
   - In your Vercel project dashboard, go to "Storage" tab
   - Click "Create Database" → Select "Postgres"
   - Vercel automatically creates the `POSTGRES_URL` environment variable
   - Add `DATABASE_URL` in Vercel environment variables if it wasn't crreated automatically

2. **Using External PostgreSQL Database** (Or if you didn't create Vercel Postgres)
   - Use any PostgreSQL provider (Supabase, Neon, Railway, etc.)
   - Get your connection string from the provider
   - Add `DATABASE_URL` in Vercel environment variables:
     ```
     DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
     ```

3. **Configure Prisma**
   - Prisma uses `DATABASE_URL` from environment variables
   - The build process automatically runs `prisma generate`
   - Your Prisma schema will use the connection string

4. **Run Initial Migration**
   - After first deployment, run migrations:
     ```bash
     npx prisma migrate deploy
     ```
   - Or use Vercel's CLI:
     ```bash
     vercel env pull .env.local
     npx prisma migrate deploy
     ```

### View Database (Optional)

```bash
# Open Prisma Studio to view/edit data
npm run db:studio
```

## Deployment Guide

### Vercel

Vercel is the easiest way to deploy Next.js applications.

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [Vercel](https://vercel.com/)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Configure environment variables:
     - Add all variables from your `.env.local`
     - Update `NEXTAUTH_URL` to your Vercel domain
     - Update `OPENROUTER_REFERER_URL` to your Vercel domain
   - Click "Deploy"

3. **Update Google OAuth Redirect URI**
   - Go to Google Cloud Console
   - Add your Vercel domain: `https://your-app.vercel.app/api/auth/callback/google`

4. **Build Configuration**
   - Vercel automatically detects Next.js
   - Build command: `npm run build` (includes Prisma generate)
   - Output directory: `.next`


### Environment Variables for Production

Make sure to set these in your hosting provider:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Your production URL (e.g., `https://your-app.vercel.app`) | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth (same as development) | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key | Yes |
| `OPENROUTER_MODEL` | Model to use | No |
| `OPENROUTER_REFERER_URL` | Your production URL | No |
| `OPENROUTER_APP_NAME` | Your app name | No |
| `SERPAPI_KEY` | SerpAPI key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth configuration
│   │   ├── chat/                 # Chat API endpoint (streaming)
│   │   ├── search/               # Search API endpoint
│   │   ├── conversations/         # Conversation CRUD endpoints
│   │   └── messages/             # Message persistence endpoint
│   ├── auth/
│   │   └── signin/               # Sign-in page
│   ├── chat/                     # Main chat page
│   └── layout.tsx                # Root layout
├── components/
│   ├── ChatInterface.tsx         # Main chat component
│   ├── ConversationSidebar.tsx   # Conversation list sidebar
│   ├── MessageList.tsx           # Message list component
│   ├── MessageBubble.tsx         # Individual message with markdown
│   ├── MessageInput.tsx          # Message input with stop button
│   ├── SearchResults.tsx         # Search results with scrolling images
│   ├── DeleteModal.tsx           # Delete confirmation modal
│   ├── Header.tsx                # App header with mode toggle
│   ├── ModeToggle.tsx           # Chat/Search mode toggle
│   └── UserProfile.tsx          # User profile with logout
├── hooks/
│   ├── useConversations.ts      # Conversation state management
│   ├── useMessages.ts           # Message state management
│   ├── useMessageHandler.ts     # Message sending logic
│   └── useConversation.ts       # Conversation creation
├── lib/
│   ├── api.ts                   # Centralized API client
│   ├── auth.ts                  # NextAuth configuration
│   ├── openrouter.ts            # OpenRouter API client
│   ├── chatStream.ts            # Chat streaming handler
│   ├── search.ts                # Search handler
│   ├── db.ts                    # Prisma client
│   ├── user.ts                  # User helper functions
│   ├── mode.ts                  # Mode derivation logic
│   └── utils/
│       ├── response.ts           # Response validation utilities
│       ├── tokens.ts             # Token calculation utilities
│       └── stream.ts             # Stream processing utilities
├── prisma/
│   └── schema.prisma            # Database schema
├── types/
│   └── chat.ts                  # TypeScript types
└── middleware.ts                # Route protection middleware
```

## Usage

### Chat Mode

1. Sign in with your Google account
2. Select "Chat" mode from the toggle
3. Type your message and press Enter or click Send
4. Receive streaming AI responses in real-time
5. Click the stop button to cancel a streaming response
6. View formatted markdown responses with syntax-highlighted code blocks

### Search Mode

1. Sign in with your Google account
2. Select "Search" mode from the toggle
3. Enter your search query
4. View search results with images displayed inline
5. Scroll horizontally through images to see more results
6. Click on search result links to open in a new tab

### Conversation Management

1. **Create New Conversation**: Click the "+" button in the sidebar
2. **Switch Conversations**: Click on any conversation in the sidebar
3. **Delete Conversation**: Click the delete icon on a conversation and confirm
4. **Persistent History**: All conversations are saved and persist across sessions
5. **Mode Per Conversation**: Each conversation remembers its chat/search mode

## Troubleshooting

### Authentication Issues

**Problem**: "OAuth error" or redirect not working

**Solutions:**
- Verify `NEXTAUTH_URL` matches your deployment URL exactly
- Check that redirect URI in Google Cloud Console matches: `{NEXTAUTH_URL}/api/auth/callback/google`
- Ensure `NEXTAUTH_SECRET` is set and consistent
- Check browser console for specific error messages

### OpenRouter API Errors

**Problem**: "No cookie auth credentials found" (401 error)

**Solutions:**
- Verify `OPENROUTER_API_KEY` is set correctly
- Check your OpenRouter account has credits
- Ensure privacy settings are configured: [OpenRouter Privacy Settings](https://openrouter.ai/settings/privacy)

**Problem**: "No endpoints found matching your data policy"

**Solutions:**
- Go to [OpenRouter Privacy Settings](https://openrouter.ai/settings/privacy)
- Enable the models you want to use
- Configure your data policy settings

### Database Connection Errors

**Problem**: "Can't reach database server"

**Solutions:**
- Verify `DATABASE_URL` is correct
- Check PostgreSQL server is running: `pg_isready` or check service status
- For cloud databases, ensure your IP is whitelisted
- Check database credentials are correct

**Problem**: Prisma Client not generated

**Solutions:**
```bash
npm run db:generate
```

### Build Errors

**Problem**: Build fails with Prisma errors

**Solutions:**
```bash
# Generate Prisma Client before build
npm run db:generate
npm run build
```


### API Rate Limits

**Problem**: 429 errors from APIs

**Solutions:**
- Check your API usage in provider dashboards
- Upgrade your plan if needed
- Implement rate limiting or caching if necessary

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Database
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database (development)
npm run db:migrate   # Run migrations (production)
npm run db:studio    # Open Prisma Studio

# Production
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Code Structure

- **API Routes**: Located in `app/api/` - handle server-side logic
- **Components**: Located in `components/` - reusable UI components
- **Hooks**: Located in `hooks/` - custom React hooks for state management
- **Lib**: Located in `lib/` - utility functions and API clients
- **Types**: Located in `types/` - TypeScript type definitions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review server logs and browser console
- Open an issue on GitHub
