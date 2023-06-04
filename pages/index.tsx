import {
  Input,
  Button,
  UnorderedList,
  ListItem,
  Box,
  Divider,
  Flex,
  Heading,
  Spacer,
  ButtonGroup,
  Select,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';
import { Header } from '@/components/Header';
import {
  onSnapshot,
  collection,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
  DocumentData,
} from 'firebase/firestore';

import { v4 as uuidv4 } from 'uuid';
import { useState, useContext, useEffect } from 'react';
import Link from 'next/link';
import { Todo, firestoreTodo } from '@/types/todo';

export default function Home() {
  const [todos, setTodos] = useState<firestoreTodo[]>([]);
  const [todo, setTodo] = useState<Todo>({ title: '', status: '' });

  {
    /* ログイン */
  }
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);
  const router: NextRouter = useRouter();

  {
    /* todoにuidをつける */
  }
  const todoId = uuidv4();

  {
    /* todo追加 */
  }
  const createTodo = async (title: string, status: string) => {
    if (!currentUser) return;
    if (title === '') return;
    await setDoc(doc(db, 'users', currentUser.uid, 'todos', todoId), {
      id: todoId,
      title: title,
      status: status,
      timestamp: serverTimestamp(),
    });
    console.log(todos);
  };

  const onSubmit = ({ title, status }: { title: string; status: string }) => {
    createTodo(title, status);
    console.log(todos);
    setTodos(todos);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    { title, status }: { title: string; status: string },
  ) => {
    if (e.key === 'Enter') onSubmit({ title, status });
  };

  {
    /* ドキュメントを取得する */
    /* orderByで並べ替え */
  }
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'users', currentUser.uid, 'todos'),
      orderBy('timestamp', 'desc'),
    );
    const unSub = onSnapshot(q, async (snapshot) => {
      setTodos(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          status: doc.data().status,
          timestamp: doc.data().timestamp,
        })),
      );
    });
    return () => {
      unSub();
    };
  }, [currentUser]);

  {
    /* todo削除 */
  }
  const deleteTodo = async (todo: firestoreTodo) => {
    console.log(todo);
    if (!currentUser) return;
    const todoRef = doc(db, 'users', currentUser.uid, 'todos', todo.id);
    await deleteDoc(todoRef)
      .then(() => {
        console.log('success');
      })
      .catch((e) => {
        console.log(e.message);
      });
    // setTodosで対象のtodoを消す
    setTodos(todos.filter((item) => item.id !== todo.id));
  };

  return (
    <>
      <Header />

      {/* Todoの追加フォーム */}
      <Box p='2' mb='20'>
        <Flex minWidth='max-content' alignItems='center' gap='2'>
          <Input
            onChange={(e) => setTodo({ ...todo, title: e.target.value })}
            type='text'
            width='100%'
            id='name'
            placeholder='Todoの追加'
            onKeyDown={(e) => handleKeyDown(e, todo)}
          />
          <Select width='140px' onChange={(e) => setTodo({ ...todo, status: e.target.value })}>
            <option value='未完了'>未完了</option>
            <option value='着手'>着手</option>
            <option value='完了'>完了</option>
          </Select>
          <ButtonGroup gap='2'>
            <Button
              colorScheme='teal'
              onClick={() => {
                onSubmit(todo);
              }}
            >
              追加
            </Button>
          </ButtonGroup>
        </Flex>
      </Box>

      {/* Todoリスト */}
      <UnorderedList listStyleType='none'>
        {todos.map((todo) => (
          <ListItem key={todo.id} p={4}>
            <Flex minWidth='max-content' alignItems='center' gap='2'>
              <Box p='2'>
                <Heading size='md'>{todo.title}</Heading>
              </Box>
              <Spacer />
              <Select width='140px'>
                <option value={todo.status}>{todo.status}</option>
              </Select>
              <ButtonGroup gap='2'>
                <Button colorScheme='red' onClick={() => deleteTodo(todo)}>
                  削除
                </Button>
                <Link as={`/${todo.id}`} href='/[id]'>
                  <Button colorScheme='blue'>編集</Button>
                </Link>
              </ButtonGroup>
            </Flex>
            <Divider orientation='horizontal' mt='4' />
          </ListItem>
        ))}
      </UnorderedList>
    </>
  );
}
