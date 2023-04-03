import Head from 'next/head';
import Image from 'next/image';
import { Inter } from '@next/font/google';
import styles from '@/styles/Home.module.css';
import { FormLabel, Input, Button, VStack } from '@chakra-ui/react';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <>
      <VStack>
        <VStack w='30vw'>
          <FormLabel htmlFor='name'>First name</FormLabel>
          <Input id='name' placeholder='name' />

          <FormLabel htmlFor='password'>Password</FormLabel>
          <Input id='password' placeholder='password' type='password' />

          <Button mt={4} colorScheme='teal'>
            Submit
          </Button>
        </VStack>
      </VStack>
    </>
  );
}
