import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithRedirect,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useState, useContext, useEffect } from 'react';

import { FIREBASE_AUTH, FIREBASE_DB, USERS_REF } from '../FirebaseConfig';

const AuthContext = createContext({});
const googleProvider = new GoogleAuthProvider();

const SUPER_LIKES_DAILY_LIMIT = 5;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Store user session
  const storeUserSession = async (user, token) => {
    try {
      const sessionData = {
        token,
        lastLoginTime: new Date().toISOString(),
        userId: user.uid,
      };
      await AsyncStorage.setItem('@user_session', JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error storing session:', error);
    }
  };

  // Login with email/password
  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email); // Add this log
      setError(null);
      const response = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      console.log('Login response:', response); // Add this log

      const token = await response.user.getIdToken();
      await storeUserSession(response.user, token);

      const userDoc = await getDoc(doc(FIREBASE_DB, 'users', response.user.uid));
      if (userDoc.exists()) {
        setUser({ ...response.user, ...userDoc.data() });
      } else {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Login error:', error); // Add this log
      setError(error.message);
      throw error;
    }
  };

  // Register with email/password
  const register = async (email, password, userData) => {
    try {
      console.log('Starting registration in AuthContext...');
      setError(null);

      // Create the user in Firebase Auth
      const response = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      console.log('User created in Firebase Auth:', response.user.uid);

      // Get the token
      const token = await response.user.getIdToken();

      // Store user session
      await storeUserSession(response.user, token);

      // Create user document reference
      const userRef = doc(FIREBASE_DB, USERS_REF, response.user.uid);

      // Prepare minimal user data for Firestore
      const userDocData = {
        uid: response.user.uid,
        email: email.toLowerCase(),
        displayName: userData.displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        photoURL: null,
        profileCompleted: false,
        superLikesRemaining: SUPER_LIKES_DAILY_LIMIT,
        lastSuperLikeDate: null,
        receivedSuperLikes: [],
      };

      // Create the user document in Firestore
      await setDoc(userRef, userDocData);

      console.log('User document created in Firestore:', response.user.uid);

      // Update local user state
      setUser({
        ...response.user,
        ...userDocData,
      });

      return response.user;
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      setError(error.message);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      await AsyncStorage.removeItem('@user_session');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUserSuperLikes = async (userId, remaining) => {
    try {
      const userRef = doc(FIREBASE_DB, USERS_REF, userId);
      await updateDoc(userRef, {
        superLikesRemaining: remaining,
        lastSuperLikeDate: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating super likes:', error);
      throw error;
    }
  };

  const attemptAutoLogin = async () => {
    try {
      console.log('Attempting auto login...');
      const storedUser = await AsyncStorage.getItem('@user_session');

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('Auto login successful');
        return true;
      }

      console.log('No stored credentials found');
      return false;
    } catch (error) {
      console.error('Auto login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updatedUserData) => {
    try {
      setUser(updatedUserData);
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Add Google Sign In function
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithRedirect(FIREBASE_AUTH, googleProvider);
      const token = await result.user.getIdToken();
      await storeUserSession(result.user, token);

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(FIREBASE_DB, USERS_REF, result.user.uid));

      if (!userDoc.exists()) {
        // Create new user document
        const userDocData = {
          uid: result.user.uid,
          email: result.user.email.toLowerCase(),
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profileCompleted: false,
          superLikesRemaining: SUPER_LIKES_DAILY_LIMIT,
          lastSuperLikeDate: null,
          receivedSuperLikes: [],
        };

        await setDoc(doc(FIREBASE_DB, USERS_REF, result.user.uid), userDocData);
        setUser({ ...result.user, ...userDocData });
      } else {
        setUser({ ...result.user, ...userDoc.data() });
      }

      return result.user;
    } catch (error) {
      console.error('Google Sign In error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        await storeUserSession(user, token);

        const userDoc = await getDoc(doc(FIREBASE_DB, 'users', user.uid));
        if (userDoc.exists()) {
          setUser({ ...user, ...userDoc.data() });
        } else {
          setUser(user);
        }
      } else {
        await AsyncStorage.removeItem('@user_session');
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    signInWithGoogle,
    updateUserProfile,
    updateUserSuperLikes,
    attemptAutoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
