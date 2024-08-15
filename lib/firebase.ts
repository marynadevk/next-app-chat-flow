import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBIKVrCisuoCKLN9VORy_5y6PjGQ7_xuDQ',
  authDomain: 'next-chat-app-c06cd.firebaseapp.com',
  projectId: 'next-chat-app-c06cd',
  storageBucket: 'next-chat-app-c06cd.appspot.com',
  messagingSenderId: '1082389400057',
  appId: '1:1082389400057:web:a4363062f6bea8e9e45528',
  measurementId: 'G-R1TK5M7EL4',
};

const app = initializeApp(firebaseConfig);
const dbFirestore = getFirestore(app);
const auth = getAuth(app);

export { app, dbFirestore, auth };