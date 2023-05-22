import { Box, Button, ButtonGroup, Heading, Spacer, Text } from '@chakra-ui/react';
import { DocumentData } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function detail(todo: DocumentData) {
  return (
    <>
      <Text>編集ページです</Text>
      <Box p='2'>
        <Heading size='md'>{todo.title}</Heading>
      </Box>
      <Spacer />
      <ButtonGroup gap='2'>
        <Button colorScheme='red'>削除</Button>
      </ButtonGroup>
      <Link href='/'>一覧へ</Link>
    </>
  );
}
