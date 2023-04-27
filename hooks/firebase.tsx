import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { useState, useEffect, createContext, useContext } from 'react';
import { NextRouter } from 'next/router';
import { User } from "../types/user";

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

// コンテクスト用の型を定義
type UserContextType = User | null ;

const AuthContext = createContext<UserContextType>(null);

export function useAuthContext() {
  return useContext(AuthContext);
}
export function AuthProvider({children}) {
  const [user, setUser] = useState('');
  const value = {
    user,
  };
  // onAuthStateChanged(auth, (user) => {
  //   if (user) setUser(user);
  // });
  // return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  useEffect(() => {
    const unsubscribed = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => {
      unsubscribed();
    };
  }, []);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

//ログアウト
export const useLogout = (router: NextRouter) => {
  const logout = () => {
    signOut(auth)
      .then(() => {
        console.log('Sign-out successful.');
        router.push('/login');
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return { logout };
};
