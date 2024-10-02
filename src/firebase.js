import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyCn7LJWpQ4B9HerUyq05w1UKwAw6abUok4",
    authDomain: "turtle-i.firebaseapp.com",
    projectId: "turtle-i",
    storageBucket: "turtle-i.appspot.com",
    messagingSenderId: "118632356863",
    appId: "1:118632356863:web:25821bde5b05e1319ba5ca",
    measurementId: "G-3CGMX4FJ3M"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);