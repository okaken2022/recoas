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
  Wrap,
  WrapItem,
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
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';

export default function Home() {
  const [todos, setTodos] = useState<firestoreTodo[]>([]);
  const [todo, setTodo] = useState<Todo>({ title: '', status: '未完了' });

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
      <Box p='4' mb='4'>
        <Wrap minWidth='max-content' alignItems='center' gap='2'>
          <WrapItem width={{ base: "100%", md: "80%"}} >
            <Input
              onChange={(e) => setTodo({ ...todo, title: e.target.value })}
              type='text'
              id='name'
              placeholder='Todoの追加'
              onKeyDown={(e) => handleKeyDown(e, todo)}
            />
          </WrapItem>
          <WrapItem>
            <Flex gap='2'>
              <Select width='140px' onChange={(e) => setTodo({ ...todo, status: e.target.value })}>
                <option value='未完了'>未完了</option>
                <option value='着手'>着手</option>
                <option value='完了'>完了</option>
              </Select>
              <Button
                colorScheme='teal'
                onClick={() => {
                  onSubmit(todo);
                }}
              >
                <AddIcon />
              </Button>
            </Flex>
          </WrapItem>
        </Wrap>
      </Box>

      {/* Todoリスト */}
      <UnorderedList listStyleType='none'>
        {todos.map((todo) => (
          <ListItem key={todo.id} p={4}>
            <Wrap minWidth='max-content' alignItems='center' gap='2'>
              <WrapItem p='2' width="60%" >
                <Heading size='md'>{todo.title}</Heading>
              </WrapItem>
              <Spacer />
              <WrapItem>
                <Select width='140px'>
                  <option value={todo.status}>{todo.status}</option>
                </Select>
                <ButtonGroup gap='2' ml="4">
                  <Button colorScheme='red' onClick={() => deleteTodo(todo)}>
                    <DeleteIcon />
                  </Button>
                  <Link as={`/${todo.id}`} href='/[id]'>
                    <Button colorScheme='blue'><EditIcon /></Button>
                  </Link>
                </ButtonGroup>
              </WrapItem>
            </Wrap>
            <Divider orientation='horizontal' mt='4' />
          </ListItem>
        ))}
      </UnorderedList>
    </>
  );
}
