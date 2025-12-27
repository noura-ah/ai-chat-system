# Database Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

**Option A: PostgreSQL (Recommended for Production)**

```bash
# Using Docker
docker-compose up -d postgres

# Or install PostgreSQL locally and create database
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

## Docker Setup

The `docker-compose.yml` includes PostgreSQL. Just run:

```bash
docker-compose up -d
```

The database will be automatically set up and migrations will run.

## Features

- ✅ Automatic message persistence
- ✅ User-based conversation isolation
- ✅ Search results and images storage
- ✅ Conversation history
- ✅ Cascade deletion
- ✅ Optimized queries

## API Endpoints

- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/[id]` - Get conversation with messages
- `DELETE /api/conversations/[id]` - Delete conversation
- `POST /api/messages` - Save a message

## Troubleshooting

### Database Connection Error

1. Check `DATABASE_URL` is correct
2. Verify database is running: `docker-compose ps`
3. Check database logs: `docker-compose logs postgres`

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

