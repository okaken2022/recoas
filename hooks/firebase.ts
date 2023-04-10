import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { useState } from 'react';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APPID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export function useAuth() {
  return auth;
}

export function useUser() {
  const [user, setUser] = useState<User>();
  onAuthStateChanged(auth, (user) => {
    if (user) setUser(user);
  });
  return user;
}
