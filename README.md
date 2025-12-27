# AI Chat System with Search

A full-stack AI chat application similar to ChatGPT with Google OAuth authentication, streaming responses, and integrated web search capabilities.

## Features

- 🤖 **AI Chat**: Real-time streaming chat responses using OpenRouter (supports multiple AI models)
- 🔍 **Web Search**: Integrated search functionality with image results
- 🔐 **Google OAuth**: Secure authentication with Google Single Sign-On
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- 📱 **Responsive Design**: Works seamlessly on mobile and desktop
- ⚡ **Streaming Responses**: Real-time AI response streaming
- 🖼️ **Image Results**: Display images from search results inline

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with Google OAuth
- **AI Provider**: OpenRouter (supports OpenAI, Anthropic, and other models)
- **Search API**: SerpAPI (configurable)

## Prerequisites

- Node.js 18+ and npm/yarn
- Google OAuth credentials (Client ID and Secret)
- OpenRouter API key
- SerpAPI key (optional, for web search)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google OAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenRouter API (supports multiple AI models)
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openai/gpt-4o-mini  # Optional: defaults to openai/gpt-4o-mini
OPENROUTER_REFERER_URL=https://your-domain.com  # Optional: for tracking
OPENROUTER_APP_NAME=AI Chat System  # Optional: app name for tracking

# Web Search API (SerpAPI)
SERPAPI_KEY=your-serpapi-key

# Database (Optional - for chat history persistence)
DATABASE_URL=postgresql://user:password@localhost:5432/ai_chat?schema=public
# Or use SQLite for development:
# DATABASE_URL="file:./dev.db"
```

### 3. Generate NextAuth Secret

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local` file

### 5. Set Up Database (Optional - for Chat History)

If you want to enable chat history persistence:

```bash
# Install dependencies (if not already done)
npm install

# Generate Prisma Client
npm run db:generate

# Push schema to database (or use migrate for production)
npm run db:push
```

For production, use migrations:
```bash
npm run db:migrate
```

**Note:** Chat history is optional. The app works without a database, but messages won't persist across sessions.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth configuration
│   │   ├── chat/                 # Chat API endpoint
│   │   └── search/               # Search API endpoint
│   ├── auth/
│   │   └── signin/               # Sign-in page
│   ├── chat/                     # Main chat page
│   └── layout.tsx                # Root layout
├── components/
│   ├── ChatInterface.tsx         # Main chat component
│   ├── MessageList.tsx           # Message list component
│   ├── MessageBubble.tsx        # Individual message component
│   ├── MessageInput.tsx         # Message input component
│   └── SearchResults.tsx        # Search results display
├── types/
│   └── chat.ts                   # TypeScript types
└── middleware.ts                 # Route protection middleware
```

## Usage

### Chat Mode

1. Sign in with your Google account
2. Select "Chat" mode from the toggle
3. Type your message and press Enter
4. Receive streaming AI responses in real-time

### Search Mode

1. Sign in with your Google account
2. Select "Search" mode from the toggle
3. Enter your search query
4. View search results with images displayed inline

## Deployment

### Docker (Recommended for Self-Hosting)

#### Prerequisites
- Docker and Docker Compose installed
- All environment variables configured

#### Quick Start

1. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

2. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application:**
   - Open http://localhost:3000 in your browser

#### Docker Commands

```bash
# Build the image
docker-compose build

# Start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

#### Using Dockerfile directly

```bash
# Build the image
docker build -t ai-chat-system .

# Run the container
docker run -p 3000:3000 --env-file .env ai-chat-system
```

#### Production Deployment

For production, make sure to:
- Set `NEXTAUTH_URL` to your production domain
- Use a reverse proxy (nginx, traefik) for HTTPS
- Configure proper firewall rules
- Set up monitoring and logging

### Vercel (Cloud Platform)

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

Make sure to set all environment variables in your deployment platform.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Your application URL | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth session encryption | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key | Yes |
| `OPENROUTER_MODEL` | Model to use (e.g., `openai/gpt-4o-mini`, `anthropic/claude-3-haiku`) | No (defaults to `openai/gpt-4o-mini`) |
| `OPENROUTER_REFERER_URL` | Your app URL for tracking | No |
| `OPENROUTER_APP_NAME` | Your app name for tracking | No |
| `SERPAPI_KEY` | SerpAPI key for web search | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Optional (for chat history) |

## Customization

### Changing AI Provider

To use a different AI provider, modify `/app/api/chat/route.ts` to use your preferred API.

### Changing Search Provider

To use a different search API, modify `/app/api/search/route.ts` to integrate with your preferred search service.

## Troubleshooting

### Authentication Issues

- Ensure Google OAuth credentials are correct
- Verify redirect URI matches in Google Cloud Console
- Check that `NEXTAUTH_URL` matches your deployment URL

### API Errors

- Verify all API keys are set correctly
- Check API rate limits
- Review browser console and server logs for errors

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

