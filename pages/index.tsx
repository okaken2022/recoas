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
import { useUser, useAuth, useLogout, db, AuthContext } from '@/hooks/firebase';
import { getAuth } from 'firebase/auth';
import { NextRouter, useRouter } from 'next/router';
import { Header } from '@/components/Header';
import { SubmitHandler, useForm } from 'react-hook-form';
import { collection, doc, setDoc, getDocs, DocumentData } from 'firebase/firestore';

import { v4 as uuidv4 } from 'uuid';
import { useState, useCallback, useContext, useEffect } from 'react';

export default function Home() {

  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);
  const router: NextRouter = useRouter();
  const { logout } = useLogout(router);

  type Todo = {
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
  const [todos, setTodos] = useState<DocumentData[]>([]);

  {/* todosコレクションの中のドキュメントにはuidを設定してtodoを追加していく*/}
  const createTodo = async ( title: string, status: string) => {
    if(!currentUser) return
    await setDoc(doc(db, 'users', currentUser.uid, 'todos', todoId), {title: title, status: status});
  }

  {/* ドキュメントを取得する */}
  //第二引数の配列が変化した時のみ実行される。
  // const getTodos = useCallback(() => {

  //   if (!user) return
  //   // 即時関数。宣言と実行を同時に行う。usecallbackの中に即時関数を描き、非同期処理を行う。
  //   // reactHooksと同時に非同期処理ができない。

  //   (async() => {
  //         const docRef = collection(db, "users", user.uid, "todos");
  //         const docSnap = await getDocs(docRef);
  //         console.log(docSnap);
  //     setTodos(docSnap);
  //   })
  //   console.log('test')
  // }, [todos])

    // 即時関数。宣言と実行を同時に行う。usecallbackの中に即時関数を描き、非同期処理を行う。
    // reactHooksと同時に非同期処理ができない。
  useEffect(() => {
    (async () => {
      if (!currentUser) return
      const docRef = collection(db, "users", currentUser.uid, "todos");
      const docSnap = await getDocs(docRef);
      const todosData = docSnap.docs.map((doc) => doc.data())
      setTodos(todosData);
    })()
  }, [auth.currentUser])
  console.log(todos);

  {/* フォームの内容をfirestoreに保存 */}
  const onSubmit: SubmitHandler<Todo> = ({ title, status }) => {
    createTodo( title, status);
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
          <Select width='140px'{...register("status")}>
            <option value='未完了'>未完了</option>
            <option value='着手'>着手</option>
            <option value='完了'>完了</option>
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
