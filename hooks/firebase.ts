import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { useState } from 'react';
import { NextRouter, useRouter } from 'next/router';

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

export const db = getFirestore(app);

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

//ログアウト
export const useLogout = (router: NextRouter) => {
  const logout = () => {
    signOut(auth)
      .then(() => {
        console.log("Sign-out successful.");
        router.push('/login');
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return { logout };
};
