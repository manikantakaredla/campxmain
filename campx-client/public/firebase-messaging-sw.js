importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Firebase requires configuration in the Service Worker to process background messages.
// We are using a URL query parameter trick so we can pass the ENV variables from the main thread 
// without hardcoding them here.

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INIT_FIREBASE') {
    firebase.initializeApp(event.data.config);
    const messaging = firebase.messaging();
    
    messaging.onBackgroundMessage(function(payload) {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      const notificationTitle = payload.notification?.title || payload.data?.title || 'CAMPX Notification';
      const notificationOptions = {
        body: payload.notification?.body || payload.data?.message,
        icon: '/pwa-192x192.png',
        data: payload.data
      };
      
      if (navigator.setAppBadge) {
        navigator.setAppBadge();
      }

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
});

// Click event for background notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Navigate to specific URL based on payload data if present
  let targetUrl = '/';
  if (event.notification.data && event.notification.data.url) {
    targetUrl = event.notification.data.url;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab with the target URL
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
