# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-using-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
SERPAPI_KEY=your-serpapi-key
```

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

## Step 3: Google OAuth Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

## Step 4: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Notes

- **SERPAPI_KEY** is optional - the app will show placeholder results if not configured
- For production, update `NEXTAUTH_URL` to your production domain
- Make sure all API keys have sufficient credits/quota

