import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { getMessagingInstance } from '../../firebase';

const NotificationDebug = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState({
    permission: Notification.permission,
    isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
    swStatus: 'Checking...',
    swScope: 'Checking...',
    fcmInitialized: 'Checking...',
    fcmToken: localStorage.getItem('fcm_token') || 'None',
    tokenUploadStatus: 'Unknown',
    lastNotification: 'None',
  });

  useEffect(() => {
    // Check Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          setDebugInfo(prev => ({
            ...prev,
            swStatus: reg.active ? 'Active' : (reg.installing ? 'Installing' : 'Waiting'),
            swScope: reg.scope,
          }));
        } else {
          setDebugInfo(prev => ({ ...prev, swStatus: 'Not registered' }));
        }
      }).catch(err => {
        setDebugInfo(prev => ({ ...prev, swStatus: `Error: ${err.message}` }));
      });
    }

    // Check Firebase Initialization
    getMessagingInstance().then(messaging => {
      setDebugInfo(prev => ({ ...prev, fcmInitialized: messaging ? 'Yes' : 'No' }));
    }).catch(err => {
      setDebugInfo(prev => ({ ...prev, fcmInitialized: `Error: ${err.message}` }));
    });
    
    // Periodically update permission
    const interval = setInterval(() => {
      setDebugInfo(prev => {
        if (prev.permission !== Notification.permission) {
          return { ...prev, permission: Notification.permission };
        }
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const testPush = async () => {
    try {
      await api.post('/notifications/test-push', { 
        title: 'Test Notification',
        message: 'This is a test notification from the debug page.',
        token: debugInfo.fcmToken
      });
      alert('Test push initiated!');
    } catch (e) {
      alert('Failed to send test push: ' + e.message);
    }
  };

  if (import.meta.env.MODE === 'production') {
    return <div className="p-8 text-center text-red-500">This page is only available in development mode.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Notification Debug</h1>
      
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="font-semibold text-gray-700">Browser Support:</div>
          <div>{debugInfo.isSupported ? '✅ Yes' : '❌ No'}</div>
          
          <div className="font-semibold text-gray-700">Notification Permission:</div>
          <div>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              debugInfo.permission === 'granted' ? 'bg-green-100 text-green-800' :
              debugInfo.permission === 'denied' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {debugInfo.permission}
            </span>
          </div>
          
          <div className="font-semibold text-gray-700">Service Worker Status:</div>
          <div>{debugInfo.swStatus}</div>
          
          <div className="font-semibold text-gray-700">Service Worker Scope:</div>
          <div className="break-all">{debugInfo.swScope}</div>
          
          <div className="font-semibold text-gray-700">Firebase Initialized:</div>
          <div>{debugInfo.fcmInitialized}</div>
          
          <div className="font-semibold text-gray-700">Local FCM Token:</div>
          <div className="break-all font-mono text-xs bg-gray-50 p-2 rounded">{debugInfo.fcmToken}</div>
        </div>
        
        <div className="mt-8 pt-6 border-t flex gap-4">
          <button 
            onClick={() => Notification.requestPermission()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition"
          >
            Request Permission
          </button>
          <button 
            onClick={testPush}
            disabled={!debugInfo.fcmToken || debugInfo.fcmToken === 'None'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
          >
            Send Test Push
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDebug;
