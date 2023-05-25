import { Box, Button, ButtonGroup, Heading, Spacer, Text } from '@chakra-ui/react';
import { DocumentData } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Header } from '@/components/Header';

export default function detail(todo: DocumentData) {
  const router = useRouter()
  const { id } = router.query
  console.log (id);

  // idを使いコレクションからtodoのドキュメントを持ってくる
  
  return (
    <>
    <Header />
    <Box p='4'>
    <Text>編集ページです</Text>
      <Heading size='md'>{todo.title}</Heading>
    <Spacer />
    <ButtonGroup gap='2'>
      <Button colorScheme='red'>削除</Button>
    </ButtonGroup>
    <Link href='/'>一覧へ</Link>
    </Box>
    </>
  );
}
