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

const app = initializeApp(firebaseConfig);

let messaging = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  } else {
    console.warn("Firebase Messaging is not supported in this browser.");
  }
}).catch(console.warn);

export const generateToken = async () => {
  try {
    if (!messaging) return null;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      if (currentToken) {
        const cachedToken = localStorage.getItem('fcm_token');
        if (cachedToken !== currentToken) {
          localStorage.setItem('fcm_token', currentToken);
          return currentToken;
        }
        return 'CACHED';
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
      console.log('Notification permission not granted.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const getMessagingInstance = () => messaging;
export { onMessage };
