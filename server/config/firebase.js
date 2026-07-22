const admin = require('firebase-admin');

// Firebase Admin SDK Configuration
// Provide the path to your service account key JSON file in .env as FIREBASE_SERVICE_ACCOUNT_PATH 
// OR the full stringified JSON as FIREBASE_SERVICE_ACCOUNT_JSON
let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  } else {
    console.warn('Firebase Admin is not initialized. Please provide FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH in .env');
  }

  if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully');
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

module.exports = admin;
