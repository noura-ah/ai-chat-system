# Docker Deployment Guide

This guide explains how to deploy the AI Chat System using Docker.

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose 2.0 or later
- All required API keys and credentials

## Quick Start

### 1. Create Environment File

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
SERPAPI_KEY=your-serpapi-key
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2. Build and Run

```bash
docker-compose up -d --build
```

The application will be available at http://localhost:3000

## Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Rebuild After Changes
```bash
docker-compose up -d --build
```

### View Container Status
```bash
docker-compose ps
```

### Execute Commands in Container
```bash
docker-compose exec app sh
```

## Production Deployment

### 1. Update Environment Variables

For production, update `.env`:

```env
NEXTAUTH_URL=https://yourdomain.com
# ... other variables
```

### 2. Use Reverse Proxy (Recommended)

Use nginx or traefik as a reverse proxy for HTTPS:

#### Example nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Docker Compose with nginx

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ai-chat-system
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: ai-chat-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## Troubleshooting

### Container won't start

1. Check logs:
   ```bash
   docker-compose logs app
   ```

2. Verify environment variables:
   ```bash
   docker-compose exec app env | grep -E 'NEXTAUTH|GOOGLE|OPENAI|SERPAPI'
   ```

3. Check if port 3000 is available:
   ```bash
   lsof -i :3000
   ```

### Build fails

1. Clear Docker cache:
   ```bash
   docker-compose build --no-cache
   ```

2. Check Dockerfile syntax

### Image size too large

The Dockerfile uses multi-stage builds to minimize image size. The final image should be around 200-300MB.

## Security Considerations

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use secrets management** in production (Docker secrets, Kubernetes secrets, etc.)
3. **Enable HTTPS** using a reverse proxy
4. **Regularly update** base images and dependencies
5. **Limit container resources** if needed:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
   ```

## Monitoring

### Health Check

The container includes a health check. Monitor it:

```bash
docker inspect ai-chat-system | grep -A 10 Health
```

### Resource Usage

```bash
docker stats ai-chat-system
```

## Updating the Application

1. Pull latest code
2. Rebuild and restart:
   ```bash
   docker-compose up -d --build
   ```

## Backup

### Backup environment variables:
```bash
cp .env .env.backup
```

### Export container data (if using volumes):
```bash
docker run --rm -v ai-chat-system-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data
```

## Support

For issues related to:
- Docker: Check Docker logs and documentation
- Application: See main README.md troubleshooting section


