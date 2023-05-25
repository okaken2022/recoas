import { Box, Button, ButtonGroup, Heading, Spacer, Text } from '@chakra-ui/react';
import { DocumentData, query } from 'firebase/firestore';
import Link from 'next/link';
import { NextRouter, useRouter } from 'next/router';

export default function detail() {
  const router = useRouter;
  const { id } = router.query;

  return (
    <>
      <Text>編集ページです</Text>
      <Box p='2'>
        <Heading size='md'>{id}</Heading>
      </Box>
      <Spacer />
      <ButtonGroup gap='2'>
        <Button colorScheme='red'>削除</Button>
      </ButtonGroup>
      <Link href='/'>一覧へ</Link>
    </>
  );
}
