# Database Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

**Option A: PostgreSQL (Recommended for Production)**

```bash
# Install PostgreSQL locally (or via your OS package manager) and create the database
createdb ai_chat
```

**Option B: SQLite (For Development)**

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 3. Configure Environment

Add to `.env.local`:
```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/ai_chat?schema=public"

# Or SQLite
DATABASE_URL="file:./dev.db"
```

### 4. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema (development)
npm run db:push

# Or use migrations (production)
npm run db:migrate
```

### 5. Verify Setup

```bash
# Open Prisma Studio to view data
npm run db:studio
```

## Features

- ✅ Automatic message persistence
- ✅ User-based conversation isolation
- ✅ Search results and images storage
- ✅ Conversation history
- ✅ Cascade deletion
- ✅ Optimized queries

## API Endpoints

### Authentication
- `GET /api/auth/[...nextauth]` - NextAuth authentication handlers
- `POST /api/auth/[...nextauth]` - NextAuth authentication handlers

### Conversations (Database)
- `GET /api/conversations` - List all conversations for the current user
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/[id]` - Get conversation with messages
- `DELETE /api/conversations/[id]` - Delete conversation

### Messages (Database)
- `POST /api/messages` - Save a message to the database

### Chat & Search
- `POST /api/chat` - Stream AI chat responses (Server-Sent Events)
- `POST /api/search` - Perform web search and return results

### Health
- `GET /api/health` - Health check endpoint

## Troubleshooting

### Database Connection Error

1. Check `DATABASE_URL` is correct
2. Verify your PostgreSQL server is running (`pg_isready`, system service status, etc.)
3. Review PostgreSQL logs (e.g., `journalctl` or log file in `/var/log/postgresql`)

### Migration Errors

```bash
# Reset database (development only!)
npx prisma migrate reset

# Or push schema again
npm run db:push
```

### Prisma Client Not Generated

```bash
npm run db:generate
```

