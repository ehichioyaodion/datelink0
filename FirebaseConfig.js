// Import the functions you need from the SDKs you need
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCNu00A9zk8Ocl95TZw5InzK9IYprENve0',
  authDomain: 'app-datelink.firebaseapp.com',
  projectId: 'app-datelink',
  storageBucket: 'app-datelink.firebasestorage.app',
  messagingSenderId: '977078934846',
  appId: '1:977078934846:web:323d0d300cf8a2ffb3a06f',
  measurementId: 'G-Z6Y3Q42KR5',
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_ANALYTICS = getAnalytics(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);

// Collection References
export const USERS_REF = 'users';
export const MATCHES_REF = 'matches';
export const PROFILES_REF = 'profiles';
export const SUPER_LIKES_REF = 'superLikes';
export const NOTIFICATIONS_REF = 'notifications';
