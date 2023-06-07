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
  updateDoc,
} from 'firebase/firestore';

import { v4 as uuidv4 } from 'uuid';
import { useState, useContext, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { Todo, firestoreTodo } from '@/types/todo';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';

export default function Home() {
  const [todos, setTodos] = useState<firestoreTodo[]>([]);
  const [todo, setTodo] = useState<Todo>({ title: '', status: '未完了' });
  const [editTodo, setEditTodo] = useState<Todo>({ title: '', status: '' });

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

  {
    /* Enter押下で送信 */
    /* 日本語変換中は送信しない */
  }
  const [composing, setComposition] = useState(false);
  const startComposition = () => setComposition(true);
  const endComposition = () => setComposition(false);
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    { title, status }: { title: string; status: string },
  ) => {
    if (e.key === 'Enter') {
      if (composing) return;
      onSubmit({ title, status });
    }
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

  {
    /* 進捗の更新 */
  }
  const updateTodo = async (todoId: string, newStatus: string) => {
    if (!currentUser) return;
    if (newStatus === '') return;
    await updateDoc(doc(db, 'users', currentUser.uid, 'todos', todoId), {
      status: newStatus,
    });
    console.log(todos);
  };

  return (
    <>
      <Header />

      {/* Todoの追加フォーム */}
      <Box p='4' mb='4'>
        <Wrap minWidth='max-content' alignItems='center' gap='2'>
          <WrapItem w={{ base: '100%', md: '80%' }}>
            <Input
              onCompositionStart={startComposition}
              onCompositionEnd={endComposition}
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
              <WrapItem p='2' width='60%'>
                <Heading size='md'>{todo.title}</Heading>
              </WrapItem>
              <Spacer />
              <WrapItem>
                <Select
                  width='140px'
                  value={todo.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    updateTodo(todo.id, newStatus);
                  }}
                >
                  <option value='未完了'>未完了</option>
                  <option value='着手'>着手</option>
                  <option value='完了'>完了</option>
                </Select>
                <ButtonGroup gap='2' ml='4'>
                  <Button colorScheme='red' onClick={() => deleteTodo(todo)}>
                    <DeleteIcon />
                  </Button>
                  <Link as={`/${todo.id}`} href='/[id]'>
                    <Button colorScheme='blue'>
                      <EditIcon />
                    </Button>
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
