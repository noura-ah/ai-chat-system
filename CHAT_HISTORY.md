# Chat History Persistence Implementation

This document describes the chat history persistence feature using PostgreSQL and Prisma.

## Overview

The chat history feature allows users to:
- Save all chat messages to a database
- Load previous conversations
- Persist search results and images
- Maintain conversation history across sessions

## Database Schema

### Models

1. **User** - Stores user information from Google OAuth
2. **Conversation** - Represents a chat session
3. **Message** - Individual messages in a conversation
4. **SearchResult** - Search results linked to messages
5. **Image** - Images from search results

## Setup

### 1. Install Dependencies

```bash
npm install @prisma/client pg
npm install -D prisma
```

### 2. Configure Database

Add to `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_chat?schema=public"
```

For Docker, use:
```env
DATABASE_URL="postgresql://postgres:password@postgres:5432/ai_chat?schema=public"
```

### 3. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Or push schema (for development)
npx prisma db push
```

## API Endpoints

### GET `/api/conversations`
Get all conversations for the current user.

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv_123",
      "title": "Chat about AI",
      "mode": "chat",
      "updatedAt": "2024-01-01T00:00:00Z",
      "messages": [...]
    }
  ]
}
```

### POST `/api/conversations`
Create a new conversation.

**Body:**
```json
{
  "title": "Optional title",
  "mode": "chat"
}
```

### GET `/api/conversations/[id]`
Get a specific conversation with all messages.

### DELETE `/api/conversations/[id]`
Delete a conversation.

### POST `/api/messages`
Save a message to the database.

**Body:**
```json
{
  "conversationId": "conv_123",
  "role": "user",
  "content": "Hello",
  "mode": "chat",
  "searchResults": [...],
  "images": [...]
}
```

## Usage

### Automatic Persistence

Messages are automatically saved when:
- User sends a message
- Assistant responds (after streaming completes)
- Search results are returned

### Loading History

Conversations are automatically loaded when:
- Component mounts with a conversationId
- User selects a previous conversation

## Docker Setup

### docker-compose.yml

Add PostgreSQL service:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ai_chat
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - app-network

  app:
    # ... existing config
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ai_chat?schema=public

volumes:
  postgres_data:
```

### Dockerfile Updates

Add Prisma generate step:

```dockerfile
# In builder stage, after copying files
RUN npx prisma generate
RUN npm run build
```

## Migration Commands

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy

# Generate client
npx prisma generate
```

## Features

- ✅ Automatic message saving
- ✅ Conversation persistence
- ✅ Search results storage
- ✅ Image storage
- ✅ User-based isolation
- ✅ Cascade deletion
- ✅ Optimized queries with indexes

## Future Enhancements

- Conversation titles from first message
- Conversation search/filter
- Export conversations
- Conversation sharing
- Message editing/deletion

