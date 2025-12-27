#!/bin/bash

# Docker Quick Start Script for AI Chat System

set -e

echo "🚀 AI Chat System - Docker Quick Start"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env.example template..."
    echo ""
    echo "Please create a .env file with the following variables:"
    echo ""
    echo "NEXTAUTH_URL=http://localhost:3000"
    echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
    echo "GOOGLE_CLIENT_ID=your-google-client-id"
    echo "GOOGLE_CLIENT_SECRET=your-google-client-secret"
    echo "OPENROUTER_API_KEY=your-openrouter-api-key"
    echo "OPENROUTER_MODEL=openai/gpt-4o-mini"
    echo "SERPAPI_KEY=your-serpapi-key"
    echo ""
    echo "After creating .env, run this script again."
    exit 1
fi

echo "✅ .env file found"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Build and start
echo "🔨 Building Docker image..."
docker-compose build

echo ""
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for application to start..."
sleep 5

# Check health
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo ""
    echo "✅ Application is running!"
    echo ""
    echo "🌐 Open http://localhost:3000 in your browser"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs:    docker-compose logs -f"
    echo "   Stop:         docker-compose down"
    echo "   Restart:      docker-compose restart"
    echo ""
else
    echo ""
    echo "⚠️  Application might still be starting..."
    echo "   Check logs with: docker-compose logs -f"
    echo "   Or wait a bit longer and check http://localhost:3000"
    echo ""
fi


