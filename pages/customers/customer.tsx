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
  HStack,
  VStack,
  Stack,
  Text,
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
import { AddIcon, CalendarIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import Layout from '@/components/Layout';

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
    setTodo({ title: '', status: '未完了' });
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
      <Layout>
        <Heading as='h2' size='xl' noOfLines={1} >
          田中太郎さん
        </Heading>
        {/* 支援目標 */}
        <Text fontSize='2xl'>支援目標</Text>
        <VStack align="start" w='100%' h='auto' m='auto' mt='4' mb='20' p='4' border='1px' rounded='md' color='#333'>
          <Text fontSize='xl'>1.日常生活のスキルの向上</Text>
          <Text>田中さんの日常生活スキルを向上させることを目標とします。具体的な目標としては、自己介助の能力の向上、食事の準備や清掃などの家事スキルの習得を挙げます。</Text>
          <Spacer />
          <Text fontSize='xl'>2.コミュニケーション能力の向上</Text>
          <Text>田中さんのコミュニケーション能力を向上させ、社会参加を促進します。具体的な目標としては、日常会話のスキルの向上、表現力や聴取能力の向上を挙げます。</Text>
        </VStack>

        {/* 利用日カレンダー */}
        <Text fontSize='2xl'>利用日カレンダー</Text>


      </Layout>
    </>
  );
}
