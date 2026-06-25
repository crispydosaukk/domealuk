'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getApiUrl } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, phone: string, referredBy?: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Call the server API to atomically claim due gift cards securely using Admin SDK
const checkAndApplyDueGifts = async (uid: string, email: string) => {
  try {
    await fetch(getApiUrl('/api/claim-gift-cards'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid, email })
    });
  } catch (err) {
    console.error('Failed to trigger gift card claim:', err);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      
      if (firebaseUser && firebaseUser.email) {
        await checkAndApplyDueGifts(firebaseUser.uid, firebaseUser.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string, phone: string, referredBy?: string) => {
    let credential;
    try {
      credential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('createUserWithEmailAndPassword failed:', err);
      throw err;
    }

    try {
      await updateProfile(credential.user, { displayName: name });
    } catch (err: any) {
      console.error('updateProfile failed:', err);
      throw err;
    }

    try {
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      await setDoc(doc(db, 'users', credential.user.uid), {
        name,
        email,
        phone,
        referralCode: generatedCode,
        referredBy: referredBy || null,
        walletBalance: 0,
        createdAt: serverTimestamp(),
      });

      // Automatically run checking for any due gift cards for this newly registered user
      await checkAndApplyDueGifts(credential.user.uid, email);

    } catch (err: any) {
      console.error('setDoc /users/ failed:', err);
      throw err;
    }

    return credential;
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
