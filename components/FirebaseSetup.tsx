import React from 'react';

const FirebaseSetup: React.FC = () => (
  <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center p-8">
    <div className="bg-white p-10 rounded-xl shadow-2xl border border-red-200 text-center max-w-2xl">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-cogs text-3xl text-red-500"></i>
      </div>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Firebase Configuration Required</h2>
      <p className="text-gray-600 mb-6">
        This application requires Firebase for data storage. For Vercel deployment, add these environment variables in your Vercel dashboard.
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-blue-800 mb-2">For Vercel Deployment:</h3>
        <ol className="text-left text-sm text-blue-700 space-y-1">
          <li>1. Go to your Vercel project dashboard</li>
          <li>2. Navigate to Settings → Environment Variables</li>
          <li>3. Add the following variables:</li>
        </ol>
      </div>

      <div className="text-left bg-gray-50 p-4 rounded-lg border text-sm font-mono text-gray-700 space-y-1 mb-6">
        <p><strong>VITE_FIREBASE_API_KEY</strong>=your-api-key</p>
        <p><strong>VITE_FIREBASE_AUTH_DOMAIN</strong>=your-project.firebaseapp.com</p>
        <p><strong>VITE_FIREBASE_PROJECT_ID</strong>=your-project-id</p>
        <p><strong>VITE_FIREBASE_STORAGE_BUCKET</strong>=your-project.appspot.com</p>
        <p><strong>VITE_FIREBASE_MESSAGING_SENDER_ID</strong>=your-sender-id</p>
        <p><strong>VITE_FIREBASE_APP_ID</strong>=your-app-id</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-bold text-green-800 mb-2">✅ Automatic Setup:</h3>
        <p className="text-sm text-green-700">
          Once you add these variables to Vercel and redeploy, the app will automatically connect to Firebase. No manual configuration needed!
      </p>
    </div>
  </div>
);

export default FirebaseSetup;