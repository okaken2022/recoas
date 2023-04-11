import Head from 'next/head';
import Image from 'next/image';
import { Inter } from '@next/font/google';
import styles from '@/styles/Home.module.css';
import { FormLabel, Input, Button, VStack } from '@chakra-ui/react';
import { useUser, useAuth, useLogout } from '@/hooks/firebase';
import { getAuth } from 'firebase/auth';
import { NextRouter, useRouter } from 'next/router';

export default function Home() {
  const auth = useAuth();
  const user = auth.currentUser;
  console.log(user);
  const router: NextRouter = useRouter();
  const {logout} = useLogout(router);

  return (
    <>
      <p>ユーザー情報:{user?.email}</p>
      <p>todoリストコンポーネントがはいります</p>
      <Button mt={4} colorScheme='teal' onClick={logout}>
        ログアウト
      </Button>
    </>
  );
}
