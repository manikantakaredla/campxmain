import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let messaging = null;
let isInitialized = false;

const initFirebase = async () => {
  if (isInitialized) return true;
  
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("Firebase Messaging is not supported in this browser.");
      return false;
    }
    
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    isInitialized = true;
    return true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return false;
  }
};

export const generateToken = async () => {
  try {
    const initialized = await initFirebase();
    if (!initialized) return { error: 'unsupported' };
    
    const permission = await Notification.requestPermission();
    if (permission === 'denied') {
      console.log('Notification permission denied.');
      return { error: 'denied' };
    }
    
    if (permission === 'granted') {
      // Ensure service worker is ready before requesting token
      const registration = await navigator.serviceWorker.ready;
      
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
      });
      
      if (currentToken) {
        const cachedToken = localStorage.getItem('fcm_token');
        
        if (cachedToken !== currentToken) {
          localStorage.setItem('fcm_token', currentToken);
          return { token: currentToken, oldToken: cachedToken };
        }
        return { token: currentToken, oldToken: null, cached: true };
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return { error: 'no_token' };
      }
    } else {
      return { error: 'default' }; // user dismissed the prompt
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return { error: 'error', details: err.message };
  }
};

export const getMessagingInstance = async () => {
  await initFirebase();
  return messaging;
};

export { onMessage };
