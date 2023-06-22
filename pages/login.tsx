import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button, FormLabel, Input, VStack, useToast } from '@chakra-ui/react';
import NextLink from 'next/link';
import { Header } from '@/components/Header';

import { useAuth, useUser } from '@/hooks/firebase';

type Inputs = {
  email: string;
  password: string;
  confirmationPassword: string;
};

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const auth = useAuth();
  const currentUser = useUser();
  const router = useRouter();

  //login機能
  const toast = useToast();
  const login = async (email: string, password: string) => {
    try {
      const UserCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('ログイン成功');
      router.push('/home');
      toast({
        title: 'ログインしました。',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: 'ログインできませんでした。',
        description: 'メールアドレス、またはパスワードが異なります。',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const onSubmit: SubmitHandler<Inputs> = ({ email, password }) => {
    login(email, password);
  };

  useEffect(() => {
    if (currentUser) router.push('/');
  }, [currentUser, router]);

  return (
    <>
      <Header />
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
          ログイン
        </Button>
      </VStack>
    </>
  );
}
