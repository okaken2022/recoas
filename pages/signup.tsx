import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, FormLabel, Input, VStack, Box, Text, Link } from '@chakra-ui/react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import 'firebase/firestore';
import NextLink from 'next/link';

import { useAuth, useUser, db } from '@/hooks/firebase';

type Signup = {
  email: string;
  password: string;
  confirmationPassword: string;
};

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Signup>();

  const auth = useAuth();
  const currentUser = useUser();
  const usersRef = collection(db, 'users');

  const signup = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      //データベースのusersコレクションに入れる
      await setDoc(doc(db, 'users', user.uid), { email: email, password: password });
      // user.todo
      console.log('ユーザー登録成功');
    } catch (e) {
      console.error(e);
    }
  };

  const onSubmit: SubmitHandler<Signup> = ({ email, password }) => {
    signup(email, password);
  };

  const router = useRouter();

  useEffect(() => {
    if (currentUser) router.push('/');
  }, [currentUser, router]);

  return (
    <>
      <Box bg='#3778B8' w='100%' p={4} color='white' mb={100}>
        <Text fontSize='2xl'>Todo List</Text>
      </Box>
      <VStack w={{ base: '90vw', md: '30vw' }} mx='auto'>
        <FormLabel htmlFor='name'>メールアドレス</FormLabel>
        <Input id='name' placeholder='email' {...register('email', { required: true })} />
        <FormLabel htmlFor='password'>パスワード</FormLabel>
        <Input
          id='password'
          placeholder='password'
          type='password'
          {...register('password', { required: true })}
        />
        <Button mt={4} colorScheme='teal' onClick={handleSubmit(onSubmit)}>
          アカウント作成
        </Button>
        <Link as={NextLink} href='/login'>
          ログインはこちら
        </Link>
      </VStack>
    </>
  );
}
