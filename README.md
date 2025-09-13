<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1pjylJHDg-mJvlUz3n24lICpj1Z0r7a1C

## Firebase Setup (Replaces Supabase)

This app now uses Firebase Firestore for persistence.

### 1. Firebase Project
1. Go to https://console.firebase.google.com and create (or select) the project `panchakarma-workload`.
2. Enable Firestore in production or test mode (test mode recommended for initial development, then tighten rules).
3. (Optional) Create a Web App within the Firebase project to obtain config values.

### 2. Configuration
The Firebase config is currently in `firebaseClient.ts`. To externalize via environment variables, set these in Vercel (Settings → Environment Variables) and modify `firebaseClient.ts` to read `import.meta.env.*` values:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=panchakarma-workload.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=panchakarma-workload
VITE_FIREBASE_STORAGE_BUCKET=panchakarma-workload.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=374465789655
VITE_FIREBASE_APP_ID=1:374465789655:web:0c8627195040917274fa92
```

### 3. Firestore Data Structure
Collection: `daily_record`
Document ID: `YYYY-MM-DD`
Document shape:
```
{
   date: string,
   scholars: Scholar[],
   patients: Patient[],
   assignments: Assignment[],
   created_at: ISOString,
   updated_at: ISOString
}
```

No server-side functions are required; aggregations are performed client-side.

## Run Locally

**Prerequisites:** Node.js, Firebase project

1. Copy `.env.example` to `.env.local` (optional if using inline config) and fill values if you want environment-based config.
2. Install dependencies: `npm install`
3. Run the app: `npm run dev`

