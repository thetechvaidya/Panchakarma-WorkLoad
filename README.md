<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1pjylJHDg-mJvlUz3n24lICpj1Z0r7a1C

## Firebase Setup for Vercel

This app uses Firebase for data storage. For automatic deployment on Vercel:

### 1. Firebase Project Setup
- Create a Firebase project at https://console.firebase.google.com
- Enable Firestore Database
- Get your project configuration from Project Settings → General → Your apps

### 2. Vercel Environment Variables
Add these environment variables in your Vercel dashboard (Settings → Environment Variables):

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Automatic Deployment
Once environment variables are set, Vercel will automatically:
- Build the app with Firebase integration
- Connect to your Firebase project
- Deploy with full functionality

## Run Locally

**Prerequisites:** Node.js, Firebase project

1. Copy `.env.example` to `.env.local` and add your Firebase config
2. Install dependencies: `npm install`
3. Run the app: `npm run dev`

