import {
  Button,
  Box,
  Select,
  Wrap,
  WrapItem,
  Text,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';
import {
  collection,
  orderBy,
  query,
} from 'firebase/firestore';

import { useState, useContext, useEffect } from 'react';
import { Todo, firestoreTodo } from '@/types/todo';
import { AddIcon, CalendarIcon } from '@chakra-ui/icons';
import Layout from '@/components/Layout';

export default function Home() {

  {
    /* ログイン */
  }
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);
  const router: NextRouter = useRouter();

  return (
    <>
      <Layout>
        {/* お知らせ */}
        <Text fontSize='2xl'>お知らせ</Text>
        <Box mt='4' p='4' border='1px' rounded='md' color='#333'>
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
            <Select w='100%' placeholder='生活介護'>
              <option value='option1'>田中</option>
              <option value='option2'>山田</option>
              <option value='option3'>佐藤</option>
            </Select>
          </WrapItem>
          <WrapItem w={{ base: '100%', md: '30%' }}>
            <Select placeholder='多機能 生活介護'>
              <option value='option1'>田中</option>
              <option value='option2'>山田</option>
              <option value='option3'>佐藤</option>
            </Select>
          </WrapItem>
          <WrapItem w={{ base: '100%', md: '30%' }}>
            <Select placeholder='就労継続支援B型'>
              <option value='option1'>田中</option>
              <option value='option2'>山田</option>
              <option value='option3'>佐藤</option>
            </Select>
          </WrapItem>
        </Wrap>

        {/* 管理者メニュー */}
        <Box mt='20'>
          <Text fontSize='2xl'>管理者メニュー</Text>
          <Wrap mt='4' spacing='3%' justify='center'>
            <WrapItem w={{ base: '100%', md: '30%' }}>
              <Button>
                {/* <FontAwesomeIcon icon={faUser}>
                  <i className="fa-solid fa-user" />
                </FontAwesomeIcon> */}
                ユーザー一覧
              </Button>
            </WrapItem>
            <WrapItem w={{ base: '100%', md: '30%' }}>
              <Button>
                <CalendarIcon />
                カレンダー設定
              </Button>
            </WrapItem>
            <WrapItem w={{ base: '100%', md: '30%' }}>
              <Button>
                <AddIcon />
                利用者を追加する
              </Button>
            </WrapItem>
          </Wrap>
        </Box>
      </Layout>
    </>
  );
}
