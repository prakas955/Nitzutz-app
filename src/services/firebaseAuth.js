// Firebase Anonymous Authentication Service
import { auth } from '../config/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

class FirebaseAuthService {
  constructor() {
    this.currentUser = null;
    this.authInitialized = false;
  }

  // Initialize anonymous authentication
  async initializeAuth() {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          // User is signed in
          this.currentUser = user;
          this.authInitialized = true;
          console.log('✅ Firebase Auth: User authenticated', user.uid);
          resolve(user);
        } else {
          // No user, sign in anonymously
          try {
            const userCredential = await signInAnonymously(auth);
            this.currentUser = userCredential.user;
            this.authInitialized = true;
            console.log('✅ Firebase Auth: New anonymous user created', userCredential.user.uid);
            resolve(userCredential.user);
          } catch (error) {
            console.error('❌ Firebase Auth error:', error);
            reject(error);
          }
        }
      });
    });
  }

  // Get current user ID
  getUserId() {
    return this.currentUser?.uid || null;
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Get user object
  getUser() {
    return this.currentUser;
  }
}

const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;

