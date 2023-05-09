import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { useState, useEffect, createContext, ReactNode, useContext } from 'react';
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

export function useAuth() {
  return auth;
}

export const db = getFirestore(app);


// コンテクスト用の型を定義
interface UserContextType {
  user: User | null | undefined;
}

type UserStateType = User | null | undefined;


export const AuthContext = createContext<UserStateType>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserStateType>(null);

  useEffect(() => {
    // ログイン状態を監視し、変化があったら発動
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ログインしていた場合、ユーザーコレクションからユーザーデータを参照
        const ref = doc(db, `users/${firebaseUser.uid}`);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          // ユーザーデータを取得して格納
          const appUser = (await getDoc(ref)).data() as User;
          setUser(appUser);
        } else {
          // ユーザーが未作成の場合、新規作成して格納
          const appUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName!,
            email: firebaseUser.email!
          };

          // Firestoreにユーザーデータを保存
          setDoc(ref, appUser).then(() => {
            // 保存に成功したらコンテクストにユーザーデータを格納
            setUser(appUser);
          });
        }
      } else {
        // ログインしていない場合、ユーザー情報を空にする
        setUser(null);
      }

      // このコンポーネントが不要になったら監視を終了する
      return unsubscribe;
    });
  }, []);

  // プロバイダーを作成し、配布物を格納する
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};
// 最後の行に追加

// コンテクストを受け取るメソッドを定義
export const useUser = () => useContext(AuthContext);

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
