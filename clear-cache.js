// Clear Browser Cache Script
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
      console.log('Deleted cache:', name);
    });
  });
}

// Clear Local Storage
if (typeof localStorage !== 'undefined') {
  localStorage.clear();
  console.log('Cleared localStorage');
}

// Clear Session Storage
if (typeof sessionStorage !== 'undefined') {
  sessionStorage.clear();
  console.log('Cleared sessionStorage');
}

// Unregister all service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('Unregistered service worker:', registration);
    });
  });
}

console.log('Browser cache clearing completed. Please refresh the page.');