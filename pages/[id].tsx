import { Box, Button, ButtonGroup, Heading, Spacer, Text } from '@chakra-ui/react';
import { DocumentData, DocumentSnapshot, doc, getDoc, query } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Header } from '@/components/Header';
import { useContext, useEffect, useState } from 'react';
import { Todo } from '@/types/todo';
import { AuthContext, db, useAuth } from '@/hooks/firebase';

export default function detail() {
  const [todo, setTodo] = useState<Todo>({ title: '', status: '' });

  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);

  const router = useRouter()
  const { id } = router.query
  console.log (id);
  console.log (currentUser?.uid);

  // idを使いコレクションからtodoのドキュメントを持ってくる
  // 画面が遷移する場合はglobalstateで管理するか、firestoreから取ってくるしかない
  
  {
    /* 編集するTodoを取得する */
  }
  
  const targetTodo = async() => {
    if (!currentUser) return;
    const userDocumentRef = doc(db, 'users', currentUser.uid, 'todos', id);
    getDoc(userDocumentRef).then((documentSnapshot: DocumentSnapshot<DocumentData>) => {
    console.log(documentSnapshot.data());
  })}

  targetTodo();

  return (
    <>
    <Header />
    <Box p='4'>
    <Text>{id}</Text>
      <Heading size='md'>{id}</Heading>
    <Spacer />
    <ButtonGroup gap='2'>
      <Button colorScheme='red'>削除</Button>
    </ButtonGroup>
    <Link href='/'>一覧へ</Link>
    </Box>
    </>
  );
}
