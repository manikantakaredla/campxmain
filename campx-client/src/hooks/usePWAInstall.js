import { useState, useEffect } from 'react';

const HIDE_PROMPT_KEY = 'campx_install_prompt_hidden';
const HIDE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Custom hook to handle Progressive Web App installation logic
 * @returns {{
 *   showPrompt: boolean,
 *   handleInstall: () => Promise<void>,
 *   handleDismiss: () => void
 * }}
 */
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasWaited, setHasWaited] = useState(false);

  useEffect(() => {
    // 3 seconds delay before potentially showing the prompt
    const timer = setTimeout(() => {
      setHasWaited(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check localStorage for dismissal
    const hiddenData = localStorage.getItem(HIDE_PROMPT_KEY);
    if (hiddenData) {
      const { timestamp, permanent } = JSON.parse(hiddenData);
      if (permanent || (Date.now() - timestamp < HIDE_DURATION_MS)) {
        return; // Do not show
      }
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      if (process.env.NODE_ENV === 'development') {
        console.log('beforeinstallprompt event fired and captured');
      }
    };

    const handleAppInstalled = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('App installed successfully');
      }
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem(HIDE_PROMPT_KEY, JSON.stringify({ timestamp: Date.now(), permanent: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    // Show prompt only if:
    // - We have waited 3 seconds
    // - App is not installed
    // - We have the deferredPrompt (meaning beforeinstallprompt fired)
    // - Not dismissed recently
    if (hasWaited && !isInstalled && deferredPrompt) {
      setShowPrompt(true);
    }
  }, [hasWaited, isInstalled, deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (process.env.NODE_ENV === 'development') {
      console.log(`User response to the install prompt: ${outcome}`);
    }

    // We clear the prompt regardless of outcome as it can only be used once
    setDeferredPrompt(null);
    setShowPrompt(false);

    if (outcome === 'accepted') {
      localStorage.setItem(HIDE_PROMPT_KEY, JSON.stringify({ timestamp: Date.now(), permanent: true }));
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(HIDE_PROMPT_KEY, JSON.stringify({ timestamp: Date.now(), permanent: false }));
  };

  return {
    showPrompt,
    handleInstall,
    handleDismiss
  };
};
