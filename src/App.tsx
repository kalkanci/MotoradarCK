import React, { useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';

const App: React.FC = () => {
  
  // Handle global promise rejections for media playback failures
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.name === 'NotSupportedError') {
        event.preventDefault(); 
        console.warn('Media playback warning: Autoplay policy prevented playback.');
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // PWA Initialization
  useEffect(() => {
    // 1. Inject Manifest dynamically if missing (though usually handled by build)
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
    }

    // 2. Register Service Worker (Standard manual registration)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Vite PWA plugin generates sw.js at the root of dist
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => console.log('SW Registered: ', registration.scope),
          (err) => console.log('SW Registration Failed: ', err)
        );
      });
    }
  }, []);

  return (
    <div className="App">
      <DashboardLayout />
    </div>
  );
}

export default App;