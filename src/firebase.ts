import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import {
  getAuth,
  signInWithEmailAndPassword as fbSignIn,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
} from 'firebase/auth'

// Read env vars (Vite exposes them on import.meta.env)
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID

// Quick runtime checks to show a helpful message when env vars are missing or mistyped
if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
  throw new Error(
    'Firebase API key missing or invalid. Please set VITE_FIREBASE_API_KEY in a .env file at the project root and restart the dev server.' +
      '\nExample .env contents:\nVITE_FIREBASE_API_KEY=your_api_key_here\nVITE_FIREBASE_PROJECT_ID=your_project_id_here'
  )
}
if (!projectId || typeof projectId !== 'string' || projectId.trim().length === 0) {
  throw new Error(
    'Firebase projectId missing. Please set VITE_FIREBASE_PROJECT_ID in your .env file and restart the dev server.'
  )
}

const firebaseConfig = {
  apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export {
  app,
  db,
  auth,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  fbSignIn as signInWithEmailAndPassword,
  fbSignOut as signOut,
  fbOnAuthStateChanged as onAuthStateChanged,
}

export async function isAdmin(uid: string) {
  if (!uid) return false
  try {
    const d = await getDoc(doc(db, 'admins', uid))
    return d.exists()
  } catch (e) {
    console.error('isAdmin check failed', e)
    return false
  }
}
