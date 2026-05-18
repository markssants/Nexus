import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID
};

const isConfigValid = !!firebaseConfig.apiKey;

let app: any;
let db: any;
let auth: any;
let googleProvider: any;

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    const databaseId = (import.meta as any).env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "(default)";
    db = getFirestore(app, databaseId);
    
    // Enable offline persistence
    import('firebase/firestore').then(({ enableIndexedDbPersistence }) => {
      enableIndexedDbPersistence(db).catch((err) => {
          if (err.code === 'failed-precondition') {
              console.warn('Firestore persistence failed-precondition');
          } else if (err.code === 'unimplemented') {
              console.warn('Firestore persistence unimplemented');
          }
      });
    }).catch(err => console.warn('Error importing for persistence:', err));

    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export { db, auth, googleProvider };

export const signInWithGoogle = async () => {
  if (!auth) {
    alert("Firebase não configurado. Adicione as chaves no ambiente.");
    return;
  }
  return signInWithPopup(auth, googleProvider);
};

export const signOut = () => auth?.signOut();
