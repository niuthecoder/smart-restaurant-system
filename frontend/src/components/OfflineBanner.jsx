import React, { useState, useEffect } from 'react';
import { FiWifiOff } from 'react-icons/fi';

const OfflineBanner = () => {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const goOffline = () => { setOffline(true); setDismissed(false); };
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline || dismissed) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9999] flex justify-center pointer-events-none">
      <div className="pointer-events-auto mx-4 mb-4 flex items-center gap-3 bg-mono-900 text-mono-100 px-5 py-3 rounded-lg shadow-xl text-sm max-w-md">
        <FiWifiOff className="shrink-0 text-red-400" size={18} />
        <span>You are offline. Some features may not work.</span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 text-mono-400 hover:text-mono-100 transition-colors text-xs font-medium"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default OfflineBanner;
