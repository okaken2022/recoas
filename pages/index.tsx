import {
  FormLabel,
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
import { useAuth, useLogout, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';
import { Header } from '@/components/Header';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  onSnapshot,
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';

import { v4 as uuidv4 } from 'uuid';
import { useState, useContext, useEffect } from 'react';

export default function Home() {
  const auth = useAuth();
  const currentUser = auth.currentUser;

  const user = useContext(AuthContext);

  console.log(user);

  const router: NextRouter = useRouter();
  const { logout } = useLogout(router);

  type Todo = {
    id: string;
    title: string;
    status: string;
    timestamp: string;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Todo>();

  {
    /* todoにuidをつける */
  }
  const todoId = uuidv4();
  const [todos, setTodos] = useState<DocumentData[]>([]);

  {
    /* todosコレクションの中のドキュメントにはuidを設定してtodoを追加していく*/
  }
  const createTodo = async (title: string, status: string) => {
    if (!currentUser) return;
    await setDoc(doc(db, 'users', currentUser.uid, 'todos', todoId), {
      id: todoId,
      title: title,
      status: status,
      timestamp: serverTimestamp(),
    });
    console.log(todos);
  };

  {
    /* ドキュメントを取得する */
    /* orderByで並べ替えも行う */
  }

  useEffect(() => {
    const q = query(
      collection(db, 'users', currentUser.uid, 'todos'),
      orderBy('timestamp', 'desc'),
    );
    const unSub = onSnapshot(q, async (snapshot) => {
      setTodos(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          timestamp: doc.data().timestamp,
        })),
      );
    });

    return () => {
      unSub();
    };
  }, []);

  {
    /* フォームの内容をfirestoreに保存 */
  }
  const onSubmit: SubmitHandler<Todo> = ({ title, status }) => {
    createTodo(title, status);
    console.log(todos);
    setTodos(todos);
  };

  {
    /* firestoreに保存されている特定のドキュメントを削除 */
  }
  const deleteTodo = async (todo: Todo) => {
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
    /* firestoreに保存されている特定のドキュメントを編集 */
  }
  const editTodo = async ({ todoId, title, status }) => {
    if (!currentUser) return;
    const todoRef = doc(db, 'users', currentUser.uid, 'todos', todoId);
    await updateDoc(todoRef, {
      title: title,
      status: status,
    });
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
          <Input
            type='text'
            width='100%'
            id='name'
            placeholder='Todoの追加'
            {...register('title', {
              required: '必須項目です',
              maxLength: {
                value: 20,
                message: '20文字以内で入力してください',
              },
            })}
          />
          <Select width='140px' {...register('status')}>
            <option value='未完了'>未完了</option>
            <option value='着手'>着手</option>
            <option value='完了'>完了</option>
          </Select>
          <ButtonGroup gap='2'>
            <Button colorScheme='teal' onClick={handleSubmit(onSubmit)}>
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
              <ButtonGroup gap='2'>
                <Button colorScheme='red' onClick={() => deleteTodo(todo)}>
                  削除
                </Button>
                <Button colorScheme='blue' onClick={editTodo}>
                  編集
                </Button>
              </ButtonGroup>
            </Flex>
            <Divider orientation='horizontal' mt='4' />
          </ListItem>
        ))}
      </UnorderedList>
    </>
  );
}
