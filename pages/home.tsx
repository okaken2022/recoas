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
      <Header />
      <Box  w={{ base: '100%', md: '80%' }} m='auto' p='4%'>
      {/* お知らせ */}
        <Text fontSize='2xl'>お知らせ</Text>
        <Box h='200px' m='auto' mt='4' p='4' border='1px' rounded='md' color='#333'>
          <Text>4/28 田中さんの午前の記録がありません。</Text>
          <Text>4/28 田中さんの工賃の記録がありません。</Text>
          <Text>4/28 田中さんの記録がありません。</Text>
        </Box>

        {/* 利用者一覧 */}
        <Box mt='20'>
          <Text fontSize='2xl'>利用者一覧</Text>
        </Box>
        <Wrap mt='4' spacing='3%' justify='center'>
          <WrapItem w={{ base: '100%', md: '30%' }}>
            <Select w='100%'  placeholder='生活介護'>
              <option value='option1'>田中</option>
              <option value='option2'>山田</option>
              <option value='option3'>佐藤</option>
            </Select>
          </WrapItem>
          <WrapItem w={{ base: '100%', md: '30%' }}>
            <Select  placeholder='多機能 生活介護'>
              <option value='option1'>田中</option>
              <option value='option2'>山田</option>
              <option value='option3'>佐藤</option>
            </Select>
          </WrapItem>
          <WrapItem w={{ base: '100%', md: '30%' }}>
            <Select placeholder='就労以降支援B型'>
              <option value='option1'>田中</option>
              <option value='option2'>山田</option>
              <option value='option3'>佐藤</option>
            </Select>
          </WrapItem>
        </Wrap>

        {/* 管理者メニュー */}
        <Box mt='20'>
          <Text fontSize='2xl'>管理者メニュー</Text>
          <HStack>
            <Button>
              <FontAwesomeIcon icon={faUser}>
                <i className="fa-solid fa-user" />
              </FontAwesomeIcon>
              ユーザー一覧
            </Button>
            <Button>
              <CalendarIcon />
              カレンダー設定
            </Button>
            <Button>
              <AddIcon />
              利用者を追加する
            </Button>
          </HStack>
        </Box>

        {/* 開発用リンク */}
        <Text fontSize='2xl'  mt='20'>
          開発用リンク
        </Text>
        <Link href='/customers/customer'>
          <Text fontSize='l' color='blue'>
            記録一覧
          </Text>
        </Link>

      </Box>
    </>
  );
}
