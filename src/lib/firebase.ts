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
  const recordRef = doc(db, 'users', record.userId, 'screenings', record.id);
  await setDoc(recordRef, record);
}

export async function fetchUserScreenings(userId: string): Promise<ScreeningRecord[]> {
  if (!userId) return [];
  try {
    const screeningsCol = collection(db, 'users', userId, 'screenings');
    const q = query(screeningsCol, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const records: ScreeningRecord[] = [];
    snapshot.forEach(docSnap => {
      records.push(docSnap.data() as ScreeningRecord);
    });
    return records;
  } catch (err) {
    console.error('[Firebase] Error fetching user screenings:', err);
    return [];
  }
}

export function subscribeToUserScreenings(
  userId: string, 
  callback: (records: ScreeningRecord[]) => void
): () => void {
  if (!userId) return () => {};
  const screeningsCol = collection(db, 'users', userId, 'screenings');
  const q = query(screeningsCol, orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const records: ScreeningRecord[] = [];
    snapshot.forEach((docSnap) => {
      records.push(docSnap.data() as ScreeningRecord);
    });
    callback(records);
  }, (err) => {
    console.warn('[Firebase] Snapshot error, falling back to fetch:', err);
    fetchUserScreenings(userId).then(callback);
  });
}

export async function deleteScreeningFromFirestore(userId: string, screeningId: string): Promise<void> {
  if (!userId || !screeningId) return;
  const recordRef = doc(db, 'users', userId, 'screenings', screeningId);
  await deleteDoc(recordRef);
}

export async function deleteScreeningRecord(recordId: string): Promise<void> {
  if (auth.currentUser) {
    await deleteScreeningFromFirestore(auth.currentUser.uid, recordId);
  }
}

// Auth helpers
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await syncUserProfile(result.user);
  return result.user;
}

export async function loginWithGoogle(): Promise<User> {
  return signInWithGoogle();
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
