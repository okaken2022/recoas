import { Button, FormLabel, Input, VStack } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';

type Inputs = {
  email: string;
  password: string;
  confirmationPassword: string;
};

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  return(
  <>
    <VStack>
      <VStack w='30vw'>
        <FormLabel htmlFor='name'>メールアドレス</FormLabel>
        <Input id='name' placeholder='name' {...register('email', { required: true })} />
        <FormLabel htmlFor='password'>パスワード</FormLabel>
        <Input
          id='password'
          placeholder='password'
          type='password'
          {...register('password', { required: true })}
        />
        <Button mt={4} colorScheme='teal'>
          アカウント作成
        </Button>
      </VStack>
    </VStack>
  </>
  )
};

