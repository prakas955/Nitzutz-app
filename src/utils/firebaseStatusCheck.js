// Firebase Connection Status Checker
// Run this in browser console to check Firebase status

export const checkFirebaseStatus = () => {
  console.log('🔍 ===== FIREBASE STATUS CHECK =====');
  
  // Check if Firebase is imported
  try {
    const { auth, db } = require('../config/firebase');
    console.log('✅ Firebase modules loaded');
    
    // Check auth state
    if (auth && auth.currentUser) {
      console.log('✅ Firebase Auth: Connected');
      console.log('   User ID:', auth.currentUser.uid.substring(0, 20) + '...');
      console.log('   Is Anonymous:', auth.currentUser.isAnonymous);
    } else {
      console.log('❌ Firebase Auth: Not authenticated');
    }
    
    // Check Firestore
    if (db) {
      console.log('✅ Firestore: Initialized');
    } else {
      console.log('❌ Firestore: Not initialized');
    }
    
    console.log('================================');
  } catch (error) {
    console.error('❌ Error checking Firebase status:', error);
  }
};

// Make it available globally for console access
if (typeof window !== 'undefined') {
  window.checkFirebaseStatus = checkFirebaseStatus;
}

