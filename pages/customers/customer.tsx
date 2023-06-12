import {
  Heading,
  Spacer,
  VStack,
  Text,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';

import Layout from '@/components/Layout';

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useContext } from 'react';

import axios from 'axios';
import moment from 'moment';

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

        <FullCalendar
          plugins={[dayGridPlugin]}
          initialEvents={[
            { title: "initial event", start: new Date() },
            { title: "initial event2", start: "2023-06-13" },
        ]}
        />
      </Layout>
    </>
  );
}
