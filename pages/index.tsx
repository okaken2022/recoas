import Head from 'next/head';
import Image from 'next/image';
import { Inter } from '@next/font/google';
import styles from '@/styles/Home.module.css';
import {
  FormLabel,
  Input,
  Button,
  VStack,
  UnorderedList,
  ListItem,
  Box,
  Divider,
  Text,
  Flex,
  Heading,
  Spacer,
  ButtonGroup,
  Select,
} from '@chakra-ui/react';
import { useUser, useAuth, useLogout, db } from '@/hooks/firebase';
import { getAuth } from 'firebase/auth';
import { NextRouter, useRouter } from 'next/router';
import { Header } from '@/components/Header';
import { SubmitHandler, useForm } from 'react-hook-form';
import { collection, doc, setDoc } from 'firebase/firestore';

import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const auth = useAuth();
  const user = auth.currentUser;
  console.log(user);
  const router: NextRouter = useRouter();
  const { logout } = useLogout(router);

  type Todo = {
    id: number;
    title: string;
    status: string;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Todo>();

  {/* todoにuidをつける */}
  const todoId = uuidv4();

  {/* todosコレクションの中のドキュメントにはuidを設定してtodoを追加していく*/}
  const createTodo = async (id: number, title: string, status: string) => {
    await setDoc(doc(db, 'users', user.uid, 'todos', todoId), { id: 3, title: title, status: 'status'});
  }

  const onSubmit: SubmitHandler<Todo> = ({ id, title, status }) => {
    createTodo(id, title, status);
  };

  return (
    <>
      <Header />
      {/* ユーザー情報 */}
      <Box p={4}>
        <p>ユーザー情報:{user?.email}</p>
        <Button mt={4} colorScheme='teal' onClick={logout}>
          ログアウト
        </Button>
      </Box>

      {/* Todoの追加フォーム */}
      <Box p='2'>
        <Flex minWidth='max-content' alignItems='center' gap='2'>
          <FormLabel htmlFor='name'>Todo追加</FormLabel>
          <Input type="text" width='100%' id='name' placeholder='Todoの追加'
                              {...register(
                                "title",
                                {
                                    required: '必須項目です',
                                    maxLength: {
                                        value: 20,
                                        message: '20文字以内で入力してください',
                                    },
                                }
                            )}/>
          <Select width='140px' placeholder='未完了'>
            <option value='option2'>着手</option>
            <option value='option3'>完了</option>
          </Select>
          <ButtonGroup gap='2'>
            <Button colorScheme='teal' onClick={handleSubmit(onSubmit)}>追加</Button>
          </ButtonGroup>
        </Flex>
      </Box>

      {/* Todoリスト */}
      <UnorderedList listStyleType='none'>
        <ListItem p={4}>
          <Flex minWidth='max-content' alignItems='center' gap='2'>
            <Box p='2'>
              <Heading size='md'>Chakra App</Heading>
            </Box>
            <Spacer />
            <ButtonGroup gap='2'>
              <Button colorScheme='teal'>完了</Button>
              <Button colorScheme='blue'>編集</Button>
            </ButtonGroup>
          </Flex>
          <Divider orientation='horizontal' mt='4'/>
        </ListItem>
        <ListItem p={4}>
          <Flex minWidth='max-content' alignItems='center' gap='2'>
            <Box p='2'>
              <Heading size='md'>Chakra App</Heading>
            </Box>
            <Spacer />
            <ButtonGroup gap='2'>
              <Button colorScheme='teal'>完了</Button>
              <Button colorScheme='blue'>編集</Button>
            </ButtonGroup>
          </Flex>
          <Divider orientation='horizontal' mt='4'/>
        </ListItem>
        <ListItem p={4}>
          <Flex minWidth='max-content' alignItems='center' gap='2'>
            <Box p='2'>
              <Heading size='md'>Chakra App</Heading>
            </Box>
            <Spacer />
            <ButtonGroup gap='2'>
              <Button colorScheme='teal'>完了</Button>
              <Button colorScheme='blue'>編集</Button>
            </ButtonGroup>
          </Flex>
          <Divider orientation='horizontal' mt='4'/>
        </ListItem>
      </UnorderedList>
    </>
  );
}
