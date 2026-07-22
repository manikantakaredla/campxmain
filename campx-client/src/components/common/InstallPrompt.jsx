import React, { useEffect, useRef } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const InstallPrompt = () => {
  const { showPrompt, handleInstall, handleDismiss } = usePWAInstall();
  const promptRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showPrompt) {
        handleDismiss();
      }
    };

    if (showPrompt) {
      window.addEventListener('keydown', handleKeyDown);
      // Focus the modal when it appears for accessibility
      promptRef.current?.focus();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPrompt, handleDismiss]);

  if (!showPrompt) {
    return null;
  }

  return (
    <>
      <style>
        {\`
          @keyframes slideUpFadeIn {
            0% {
              opacity: 0;
              transform: translateY(16px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .animate-pwa-popup {
            animation: slideUpFadeIn 200ms ease-out forwards;
          }
        \`}
      </style>
      {/* Backdrop for mobile bottom sheet effect, hidden on desktop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 md:hidden animate-pwa-popup"
        onClick={handleDismiss}
        aria-hidden="true"
        style={{ animationName: 'fadeOnly', animationDuration: '200ms' }}
      />
      <style>
        {\`
          @keyframes fadeOnly {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
        \`}
      </style>

      <div
        ref={promptRef}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="install-prompt-title"
        aria-describedby="install-prompt-description"
        className="fixed z-50 bottom-0 left-0 right-0 md:bottom-6 md:right-6 md:left-auto md:w-96 bg-white rounded-t-2xl md:rounded-2xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] md:shadow-2xl p-6 outline-none animate-pwa-popup"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close install prompt"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">🎓</span>
            <h2 id="install-prompt-title" className="text-xl font-bold text-gray-900">
              Install CAMPX
            </h2>
          </div>

          <p id="install-prompt-description" className="text-gray-600 text-sm leading-relaxed">
            Install CAMPX for a faster and better campus experience.
          </p>

          <ul className="text-sm text-gray-700 space-y-2 mb-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Faster launch
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Push notifications
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Native app experience
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Quick access from Home Screen/Desktop
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800"
            >
              Install Now
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstallPrompt;
