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
      if (Notification.permission === 'granted') {
        registerFCMToken();
      } else if (Notification.permission === 'default') {
        // Show a prompt to ask for permission since silent request on load is often blocked
        toast.custom((t) => (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col gap-3 max-w-sm">
            <div>
              <p className="font-semibold text-gray-800">Enable Notifications</p>
              <p className="text-sm text-gray-600 mt-1">Don't miss important messages and announcements.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
              >
                Later
              </button>
              <button 
                onClick={() => {
                  toast.dismiss(t.id);
                  registerFCMToken();
                }}
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Enable
              </button>
            </div>
          </div>
        ), { duration: 10000, id: 'push-prompt' });
      }
      setupForegroundListener();
    }
  }, [isAuthenticated, user]);

  const registerFCMToken = async () => {
    try {
      const result = await generateToken();
      
      if (result.error) {
        if (result.error !== 'unsupported' && result.error !== 'denied' && result.error !== 'default') {
          console.error('Failed to generate FCM token:', result.details || result.error);
        }
        return;
      }
      
      if (!result.cached && result.token) {
        // Send token to backend, including oldToken if it exists for replacement
        await api.post('/notifications/fcm-token', { 
          token: result.token,
          oldToken: result.oldToken
        });
      }
    } catch (error) {
      console.error('Failed to register FCM token:', error);
    }
  };

  const setupForegroundListener = async () => {
    try {
      const messaging = await getMessagingInstance();
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
      }
    } catch (error) {
      console.error('Failed to setup foreground listener:', error);
    }
  };

  return null; // This component doesn't render anything
};

export default PushNotificationManager;
