import React from 'react';

const FirebaseSetup: React.FC = () => (
  <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center p-8">
    <div className="bg-white p-10 rounded-xl shadow-2xl border border-red-200 text-center max-w-2xl">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-cogs text-3xl text-red-500"></i>
      </div>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Firebase Configuration Missing</h2>
      <p className="text-gray-600 mb-6">
        This application requires a Firebase backend. To enable this, add your project's configuration keys as environment variables in your hosting provider (e.g., Vercel).
      </p>
      <p className="text-gray-600 mb-6 font-semibold">
        For security, environment variables need to be prefixed with <code className="bg-yellow-100 text-yellow-800 p-1 rounded">VITE_</code> to be accessible in the browser.
      </p>
      <div className="text-left bg-gray-50 p-4 rounded-lg border text-sm font-mono text-gray-700 space-y-1">
        <p>VITE_FIREBASE_API_KEY="your-api-key"</p>
        <p>VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"</p>
        <p>VITE_FIREBASE_PROJECT_ID="your-project-id"</p>
        <p>VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"</p>
        <p>VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"</p>
        <p>VITE_FIREBASE_APP_ID="your-app-id"</p>
      </div>
       <p className="text-xs text-gray-500 mt-4">
        You can find these values in your Firebase project settings under "General". After adding these variables with the correct prefix, the application should work.
      </p>
    </div>
  </div>
);

export default FirebaseSetup;