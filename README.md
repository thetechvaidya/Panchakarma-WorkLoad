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

## Styling / Tailwind CSS

The project uses Tailwind CSS (v4 plugin pipeline) with a single entry stylesheet at `src/index.css` included via `<link>` in `index.html`.

Key points:
- Purge/content paths defined in `tailwind.config.js` cover `index.html`, `components/**/*`, `src/**/*` and root TS/TSX.
- Custom utilities/components added via `@layer` in `src/index.css` (`.card`, `.btn-primary`, `.btn-outline`, scrollbar utilities).
- Font family defaults to Inter (loaded via Google Fonts in `index.html`).
- To add new design tokens (colors, spacing, shadows), extend `theme.extend` in `tailwind.config.js`.
- If classes don't appear, ensure they are not dynamically constructed in a way purge can't detect (avoid string concatenation building arbitrary class names).

Development tips:
```bash
npm run dev        # Rebuilds on changes
```

If Tailwind utilities appear missing in the browser:
1. Hard refresh / clear cache.
2. Inspect compiled CSS to verify presence of the utility.
3. Ensure the utility string exists verbatim in code (not computed).
4. Confirm PostCSS config uses `tailwindcss` and `autoprefixer` plugins.

