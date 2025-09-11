<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1pjylJHDg-mJvlUz3n24lICpj1Z0r7a1C

## Supabase Setup for Vercel

This app uses Supabase for data storage. For automatic deployment on Vercel:

### 1. Supabase Project Setup
- Create a Supabase project at https://supabase.com
- Get your project URL and anonymous key from Project Settings → API

### 2. Vercel Environment Variables
Add these environment variables in your Vercel dashboard (Settings → Environment Variables):

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Automatic Deployment
Once environment variables are set, Vercel will automatically:
- Build the app with Supabase integration
- Connect to your Supabase project
- Deploy with full functionality

## Run Locally

**Prerequisites:** Node.js, Supabase project

1. Copy `.env.example` to `.env.local` and add your Supabase configuration:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
2. Install dependencies: `npm install`
3. Run the app: `npm run dev`

