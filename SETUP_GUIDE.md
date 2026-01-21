# Discord Clone - Setup Guide

## Prerequisites

You have already configured:
- ✅ Clerk Authentication (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
- ✅ Stream Chat (`NEXT_PUBLIC_STREAM_KEY`, `STREAM_SECRET`)
- ⚠️ Supabase (needs proper configuration)

## Supabase Setup

The application requires a Supabase PostgreSQL database for storing users, servers, channels, messages, and sessions.

### Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create a new account
3. Click "New Project"
4. Configure:
   - Name: `discord-clone` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose closest to your users
   - Pricing: Start with Free tier

### Step 2: Get Your API Keys

After project creation, go to **Settings → API**:

1. **Project URL**: Copy the "URL" value (format: `https://xxxxx.supabase.co`)
   - Set as: `NEXT_PUBLIC_SUPABASE_URL`

2. **Anon Public Key**: Copy the "anon public" key (usually under "API keys")
   - Set as: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Service Role Key**: Copy the "service_role" key (secret - server-only)
   - Set as: `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Configure Environment Variables

In your Vercel project:
1. Go to **Settings → Environment Variables**
2. Add the three variables above
3. Ensure they're available for:
   - Production
   - Preview
   - Development (if deploying from Vercel)

### Step 4: Initialize Database Schema

Once you've set the env vars:

1. Go to Supabase Dashboard → **SQL Editor**
2. Create a new query
3. Copy the entire content from `/scripts/setup-database.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute

This will create all necessary tables:
- `users` - User profiles synced from Clerk
- `servers` - Discord-style servers
- `channels` - Text/voice/video channels
- `messages` - Chat messages
- `voice_sessions` - Active voice calls
- `video_sessions` - Active video calls
- `video_participants` - Video call participants
- `direct_messages` - DMs between users
- `notifications` - User notifications
- And supporting tables for relationships

### Step 5: Set Up Clerk Webhook

To automatically sync Clerk users to Supabase:

1. Go to **Clerk Dashboard → Webhooks**
2. Create a new webhook endpoint:
   - URL: `https://your-domain.vercel.app/api/users/sync`
   - Events: Select `user.created`, `user.updated`, `user.deleted`
   - Signing Secret: Copy it

3. In Vercel Environment Variables, add:
   - `CLERK_WEBHOOK_SECRET=` (paste the signing secret)

### Step 6: Stream Chat Configuration

Stream is pre-configured for real-time messaging. The app:
- Generates secure tokens in `/api/stream/token`
- Connects authenticated users to Stream channels
- Handles message events in real-time

No additional configuration needed beyond the initial API key setup.

## Running Locally

If developing locally, install dependencies:
```bash
npm install
```

Then set local env vars in `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STREAM_KEY=...
STREAM_SECRET=...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

Run the development server:
```bash
npm run dev
```

## Troubleshooting

### "Missing Supabase configuration" error
- Verify all three Supabase env vars are set in Vercel
- Check that env vars are deployed to your environment
- Rebuild and redeploy your application

### Database tables don't exist
- Execute the `/scripts/setup-database.sql` script in Supabase SQL Editor
- Verify all tables appear in Supabase Dashboard → Tables

### Clerk auth not working
- Ensure `clerkMiddleware()` is active (check `/middleware.ts`)
- Verify Clerk keys are correct in Vercel
- Check Clerk dashboard for API key validity

### Stream messages not loading
- Verify `NEXT_PUBLIC_STREAM_KEY` and `STREAM_SECRET` are correct
- Check that user sync to Stream is working via `/api/stream/token`
- Review browser console for Stream SDK errors

## Architecture Summary

The application uses:
- **Clerk** → User authentication & management
- **Supabase** → PostgreSQL database & real-time subscriptions
- **Stream Chat** → Real-time messaging infrastructure
- **Next.js App Router** → Server & client components
- **Tailwind CSS** → UI styling
- **TypeScript** → Type-safe code

All data flows are secured with:
- Server-side Clerk verification (middleware)
- Row-level security on Supabase tables
- Parameterized SQL queries
- User membership checks before channel access

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Get and configure API keys
3. ✅ Execute database schema script
4. ✅ Deploy to Vercel
5. Visit your app and create your first server!
