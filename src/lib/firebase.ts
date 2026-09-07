import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocFromServer,
  collection, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc,
  onSnapshot,
  type Firestore
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadString, 
  getDownloadURL,
  type FirebaseStorage 
} from 'firebase/storage';
import type { ScreeningRecord, UserProfile } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with configured Database ID
export const db: Firestore = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || '(default)');

// Initialize Firebase Storage
export const storage: FirebaseStorage = getStorage(app);

// Helper to upload retinal image to Firebase Storage
export async function uploadRetinalImageToStorage(
  userId: string,
  screeningId: string,
  base64DataUrl: string
): Promise<string> {
  try {
    const storageRef = ref(storage, `users/${userId}/screenings/${screeningId}.jpg`);
    await uploadString(storageRef, base64DataUrl, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);
    console.log('[Firebase Storage] Retinal scan persisted successfully:', downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.warn('[Firebase Storage] Image upload skipped or fallback applied:', error);
    return base64DataUrl;
  }
}

// Test Firestore Connection per Firebase Skill guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connection validated with server.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Firestore client is offline or network is limited.');
    } else {
      console.log('[Firebase] Initial connection check acknowledged.');
    }
    return false;
  }
}

// User Profile Operations
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const profile: UserProfile = {
    id: user.uid,
    email: user.email || '',
    displayName: user.displayName || 'Healthcare Specialist',
    photoURL: user.photoURL || undefined,
    role: 'clinician',
    facilityName: 'Rural Health Center (PHC)',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    console.error('[Firebase] Failed to save user profile in Firestore:', err);
  }

  return profile;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (e) {
    console.error('[Firebase] Error getting user profile:', e);
  }
  return null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const userRef = doc(db, 'users', profile.id);
  await setDoc(userRef, profile, { merge: true });
}

// Screening Records Operations
export async function saveScreeningToFirestore(record: ScreeningRecord): Promise<void> {
  if (!record.userId) {
    throw new Error('User ID is required to persist screening record');
  }

  // Always persist locally to prevent any clinical screening data loss
  try {
    const localKey = `retinaguard_screenings_${record.userId}`;
    const existing: ScreeningRecord[] = JSON.parse(localStorage.getItem(localKey) || '[]');
    const filtered = existing.filter((r) => r.id !== record.id);
    localStorage.setItem(localKey, JSON.stringify([record, ...filtered].slice(0, 50)));
  } catch (e) {
    console.warn('[Storage] Local storage save notice:', e);
  }

  // Persist to Firestore cloud database if authenticated
  if (auth.currentUser) {
    try {
      const recordRef = doc(db, 'users', record.userId, 'screenings', record.id);
      await setDoc(recordRef, record);
    } catch (err) {
      console.warn('[Firebase] Cloud Firestore write notice (record saved locally):', err);
    }
  }
}

export async function fetchUserScreenings(userId: string): Promise<ScreeningRecord[]> {
  if (!userId) return [];
  
  let localRecords: ScreeningRecord[] = [];
  try {
    const localKey = `retinaguard_screenings_${userId}`;
    localRecords = JSON.parse(localStorage.getItem(localKey) || '[]');
  } catch (e) {}

  if (!auth.currentUser) {
    return localRecords;
  }

  try {
    const screeningsCol = collection(db, 'users', userId, 'screenings');
    const q = query(screeningsCol, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const cloudRecords: ScreeningRecord[] = [];
    snapshot.forEach(docSnap => {
      cloudRecords.push(docSnap.data() as ScreeningRecord);
    });

    // Merge cloud and local records deduplicating by ID
    const merged = [...cloudRecords];
    localRecords.forEach(lr => {
      if (!merged.some(cr => cr.id === lr.id)) {
        merged.push(lr);
      }
    });
    return merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    console.warn('[Firebase] Firestore query notice, returning local cache:', err);
    return localRecords;
  }
}

export function subscribeToUserScreenings(
  userId: string, 
  callback: (records: ScreeningRecord[]) => void
): () => void {
  if (!userId) return () => {};

  // Immediately push local cache so user sees screening records without waiting
  try {
    const localKey = `retinaguard_screenings_${userId}`;
    const localRecords = JSON.parse(localStorage.getItem(localKey) || '[]');
    if (localRecords.length > 0) {
      callback(localRecords);
    }
  } catch (e) {}

  if (!auth.currentUser) {
    return () => {};
  }

  try {
    const screeningsCol = collection(db, 'users', userId, 'screenings');
    const q = query(screeningsCol, orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const cloudRecords: ScreeningRecord[] = [];
      snapshot.forEach((docSnap) => {
        cloudRecords.push(docSnap.data() as ScreeningRecord);
      });
      callback(cloudRecords);
    }, (err) => {
      console.warn('[Firebase] Firestore snapshot listener notice, serving cached records:', err);
      fetchUserScreenings(userId).then(callback);
    });
  } catch (e) {
    return () => {};
  }
}

export async function deleteScreeningFromFirestore(userId: string, screeningId: string): Promise<void> {
  if (!userId || !screeningId) return;

  // Clean from local storage
  try {
    const localKey = `retinaguard_screenings_${userId}`;
    const existing: ScreeningRecord[] = JSON.parse(localStorage.getItem(localKey) || '[]');
    localStorage.setItem(localKey, JSON.stringify(existing.filter(r => r.id !== screeningId)));
  } catch (e) {}

  if (auth.currentUser) {
    try {
      const recordRef = doc(db, 'users', userId, 'screenings', screeningId);
      await deleteDoc(recordRef);
    } catch (err) {
      console.warn('[Firebase] Failed to delete cloud document:', err);
    }
  }
}

export async function deleteScreeningRecord(recordId: string): Promise<void> {
  const currentUid = auth.currentUser?.uid || getSavedDemoClinician()?.uid;
  if (currentUid) {
    await deleteScreeningFromFirestore(currentUid, recordId);
  }
}

// Demo Clinician User Support for Instant Access in Rural/Offline or OAuth-Restricted Environments
export interface DemoClinician {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isDemo: boolean;
}

export function createDemoClinician(): DemoClinician {
  const demoClinician: DemoClinician = {
    uid: 'clinician-rural-phc-01',
    email: 'dr.teja.karthik@phc-vision.org',
    displayName: 'Dr. T. Karthik (Rural Medical Officer)',
    photoURL: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    isDemo: true,
  };
  try {
    localStorage.setItem('retinaguard_demo_clinician', JSON.stringify(demoClinician));
  } catch (e) {}
  return demoClinician;
}

export function getSavedDemoClinician(): DemoClinician | null {
  try {
    const raw = localStorage.getItem('retinaguard_demo_clinician');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearDemoClinician(): void {
  try {
    localStorage.removeItem('retinaguard_demo_clinician');
  } catch (e) {}
}

// Auth helpers
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
    clearDemoClinician();
    return result.user;
  } catch (error: any) {
    console.error('[Firebase Auth Error Details]:', error);
    throw error;
  }
}

export async function loginWithGoogle(): Promise<User> {
  return signInWithGoogle();
}

export async function logoutUser(): Promise<void> {
  clearDemoClinician();
  if (auth.currentUser) {
    await signOut(auth);
  }
}

export { onAuthStateChanged };
