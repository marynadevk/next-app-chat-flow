import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { envFirebase } from '@/config';

const firebaseConfig = {
  apiKey: envFirebase.apiKey,
  authDomain: envFirebase.authDomain,
  projectId: envFirebase.projectId,
  storageBucket: envFirebase.storageBucket,
  messagingSenderId: envFirebase.messagingSenderId,
  appId: envFirebase.appId,
  measurementId: envFirebase.measurementId,
};

const app = initializeApp(firebaseConfig);
const dbFirestore = getFirestore(app);
const auth = getAuth(app);

export { app, dbFirestore, auth };