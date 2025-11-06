// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhKfb3FzGgVyZMdH_8g5GuOsQaPbU09ck",
  authDomain: "nitzutz-app.firebaseapp.com",
  projectId: "nitzutz-app",
  storageBucket: "nitzutz-app.firebasestorage.app",
  messagingSenderId: "437341444085",
  appId: "1:437341444085:web:9d321843ad3e18fdc2f2bc"
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Initialize Firestore with cache settings (new method)
  db = getFirestore(app);
  
  // Enable offline persistence (using current method - will migrate to cache settings in future)
  enableIndexedDbPersistence(db, { cacheSizeBytes: CACHE_SIZE_UNLIMITED })
    .then(() => {
      console.log('✅ Firebase offline persistence enabled');
      console.log('✅ Firebase initialized successfully');
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('⚠️ Browser doesn\'t support offline persistence');
      } else {
        console.warn('⚠️ Offline persistence warning:', err.message);
      }
      // Still log success even if persistence fails
      console.log('✅ Firebase initialized successfully (online mode only)');
    });
  
  // Log immediately (before persistence check completes)
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

export { app, auth, db };

