import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateToken, onMessage, getMessagingInstance } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PushNotificationManager = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      registerFCMToken();
      setupForegroundListener();
      initializeServiceWorker();
    }
  }, [isAuthenticated, user]);

  const registerFCMToken = async () => {
    try {
      const token = await generateToken();
      if (token && token !== 'CACHED') {
        // Send token to backend
        await api.post('/notifications/fcm-token', { token });
      }
    } catch (error) {
      console.error('Failed to register FCM token:', error);
    }
  };

  const setupForegroundListener = () => {
    const checkAndSetup = () => {
      const messaging = getMessagingInstance();
      if (messaging) {
        onMessage(messaging, (payload) => {
          console.log('Foreground Message received. ', payload);
          const title = payload.notification?.title || payload.data?.title;
          const body = payload.notification?.body || payload.data?.message;
          const url = payload.data?.url || '/';

          // Update badge
          if (navigator.setAppBadge) {
            api.get('/notifications/unread/count')
              .then(res => {
                if (res.data.success && res.data.unreadCount !== undefined) {
                  navigator.setAppBadge(res.data.unreadCount);
                }
              }).catch(e => console.error(e));
          }

          if (title && body) {
            toast(
              (t) => (
                <div onClick={() => {
                  toast.dismiss(t.id);
                  navigate(url);
                }} className="cursor-pointer w-full h-full">
                  <strong className="block font-semibold">{title}</strong>
                  <span className="text-sm">{body}</span>
                </div>
              ),
              {
                duration: 5000,
                icon: '🔔',
              }
            );
          }
        });
      } else {
        setTimeout(checkAndSetup, 1000);
      }
    };
    
    checkAndSetup();
  };

  const initializeServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'INIT_FIREBASE',
            config: {
              apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
              authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
              projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
              storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
              messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
              appId: import.meta.env.VITE_FIREBASE_APP_ID,
            }
          });
        }
      });
    }
  };

  return null; // This component doesn't render anything
};

export default PushNotificationManager;
