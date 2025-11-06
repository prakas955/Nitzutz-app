// Firestore Database Service
import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  deleteDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

class FirestoreService {
  constructor() {
    this.userId = null;
  }

  setUserId(uid) {
    this.userId = uid;
    console.log('✅ Firestore: User ID set', uid);
  }

  // ==========================================
  // CHAT MESSAGES
  // ==========================================

  // Save chat message
  async saveChatMessage(message, sender) {
    if (!this.userId) throw new Error('User not authenticated');
    
    try {
      const messageRef = doc(collection(db, 'users', this.userId, 'messages'));
      await setDoc(messageRef, {
        text: message,
        sender: sender,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      });
      console.log('✅ Chat message saved');
      return messageRef.id;
    } catch (error) {
      console.error('❌ Error saving chat message:', error);
      throw error;
    }
  }

  // Load chat messages (last 50)
  async loadChatMessages() {
    if (!this.userId) return [];
    
    try {
      const messagesRef = collection(db, 'users', this.userId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse(); // Reverse to show oldest first
      
      console.log(`✅ Loaded ${messages.length} chat messages`);
      return messages;
    } catch (error) {
      console.error('❌ Error loading chat messages:', error);
      return [];
    }
  }

  // ==========================================
  // GOALS
  // ==========================================

  // Save goal
  async saveGoal(goal) {
    if (!this.userId) throw new Error('User not authenticated');
    
    try {
      const goalRef = doc(db, 'users', this.userId, 'goals', goal.id.toString());
      await setDoc(goalRef, {
        ...goal,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log('✅ Goal saved:', goal.title);
      return goalRef.id;
    } catch (error) {
      console.error('❌ Error saving goal:', error);
      throw error;
    }
  }

  // Load all goals
  async loadGoals() {
    if (!this.userId) return [];
    
    try {
      const goalsRef = collection(db, 'users', this.userId, 'goals');
      const snapshot = await getDocs(goalsRef);
      
      const goals = snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      }));
      
      console.log(`✅ Loaded ${goals.length} goals`);
      return goals;
    } catch (error) {
      console.error('❌ Error loading goals:', error);
      return [];
    }
  }

  // Delete goal
  async deleteGoal(goalId) {
    if (!this.userId) throw new Error('User not authenticated');
    
    try {
      const goalRef = doc(db, 'users', this.userId, 'goals', goalId.toString());
      await deleteDoc(goalRef);
      console.log('✅ Goal deleted');
    } catch (error) {
      console.error('❌ Error deleting goal:', error);
      throw error;
    }
  }

  // ==========================================
  // ACTION PLANS
  // ==========================================

  // Save action plan (today's steps and week's steps)
  async savePlan(planData) {
    if (!this.userId) throw new Error('User not authenticated');
    
    try {
      const planRef = doc(db, 'users', this.userId, 'plans', 'current');
      await setDoc(planRef, {
        ...planData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log('✅ Action plan saved');
    } catch (error) {
      console.error('❌ Error saving plan:', error);
      throw error;
    }
  }

  // Load action plan
  async loadPlan() {
    if (!this.userId) return null;
    
    try {
      const planRef = doc(db, 'users', this.userId, 'plans', 'current');
      const snapshot = await getDoc(planRef);
      
      if (snapshot.exists()) {
        console.log('✅ Action plan loaded');
        return snapshot.data();
      } else {
        console.log('ℹ️ No saved plan found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading plan:', error);
      return null;
    }
  }

  // ==========================================
  // SAFETY PLANS
  // ==========================================

  // Save safety plan
  async saveSafetyPlan(safetyPlan) {
    if (!this.userId) throw new Error('User not authenticated');
    
    try {
      const planRef = doc(db, 'users', this.userId, 'safetyPlans', 'main');
      await setDoc(planRef, {
        ...safetyPlan,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log('✅ Safety plan saved');
    } catch (error) {
      console.error('❌ Error saving safety plan:', error);
      throw error;
    }
  }

  // Load safety plan
  async loadSafetyPlan() {
    if (!this.userId) return null;
    
    try {
      const planRef = doc(db, 'users', this.userId, 'safetyPlans', 'main');
      const snapshot = await getDoc(planRef);
      
      if (snapshot.exists()) {
        console.log('✅ Safety plan loaded');
        return snapshot.data();
      } else {
        console.log('ℹ️ No safety plan found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading safety plan:', error);
      return null;
    }
  }

  // ==========================================
  // REAL-TIME LISTENERS
  // ==========================================

  // Subscribe to chat messages (real-time updates)
  subscribeToChatMessages(callback) {
    if (!this.userId) return () => {};
    
    const messagesRef = collection(db, 'users', this.userId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
      callback(messages);
    });
    
    return unsubscribe;
  }

  // Subscribe to goals (real-time updates)
  subscribeToGoals(callback) {
    if (!this.userId) return () => {};
    
    const goalsRef = collection(db, 'users', this.userId, 'goals');
    
    const unsubscribe = onSnapshot(goalsRef, (snapshot) => {
      const goals = snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      }));
      callback(goals);
    });
    
    return unsubscribe;
  }
}

const firestoreService = new FirestoreService();
export default firestoreService;

