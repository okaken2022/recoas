import {
  Heading,
  Spacer,
  VStack,
  Text,
  Box,
  Grid,
  GridItem,
  Flex,
  Input,
  UnorderedList,
  ListItem,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';

import Layout from '@/components/Layout';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useContext, useEffect, useState } from 'react';

import axios from 'axios';
import moment from 'moment';
import { EventContentArg } from '@fullcalendar/core';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { Record } from '@/types/recoad';
import { DailyRecord } from '@/types/dailyRecord';
import { addDoc, collection } from 'firebase/firestore';

export default function RecordPage() {
  {
    /* state */
  }
  const [addDailyRecord, setAddDailyRecord] = useState<DailyRecord>({
    // FullCalendarから持ってきたstartの値を入れる
    start: '',
    editor: '',
    amWork: '',
    pmWork: '',
  });

  {
    /* ログイン */
  }
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);

  {
    /* ルーティング */
  }
  const router: NextRouter = useRouter();
  const { date } = router.query as { date: string };
  const formattedDate = moment(date).format('YYYY年M月D日 (ddd)');

  {
    /* 記録母体保存 */
  }
  const createDailyRecord = async (
    start: string,
    editor: string,
    amWork: string,
    pmWork: string,
  ) => {
    if (!currentUser) return;
    if (start === '') return;
    await addDoc(collection(db, 'customers'), {
      start: start,
      editor: editor,
      amWork: amWork,
      pmWork: pmWork,
    });
  };

  const onSubmit = ({
    start,
    editor,
    amWork,
    pmWork,
  }: {
    start: string;
    editor: string;
    amWork: string;
    pmWork: string;
  }) => {
    createDailyRecord(start, editor, amWork, pmWork);
    setAddDailyRecord({ start: '', editor: '', amWork: '', pmWork: '' });
    console.log(addDailyRecord);
    setAddDailyRecord(addDailyRecord);
  };

  return (
    <>
      <Layout>
        <Heading color='color.sub' as='h2' mb='8' size='xl' noOfLines={1}>
          田中太郎さん
        </Heading>
        {/* 記録全体 */}
        <Grid
          h='auto'
          templateRows='repeat(7, 1fr)'
          templateColumns='repeat(2, 1fr)'
          // gap={2}
          border='1px'
          borderTopRadius='md'
        >
          {/* 日付 */}
          <GridItem rowSpan={2} colSpan={2} bg='color.mainTransparent1' p={2}>
            <Flex alignItems='center'>
              <Text fontSize={{ base: 'md', md: 'xl' }}>{formattedDate}</Text>
              <Spacer />

              {/* 記入者 */}
              <Text>記入者：</Text>
              <Input
                placeholder='岡田'
                width='30%'
                bg='white'
                type='text'
                id='editor'
                value={addDailyRecord.editor}
                onChange={(e) => setAddDailyRecord({ ...addDailyRecord, editor: e.target.value })}
              />
            </Flex>
          </GridItem>

          {/* 活動 */}
          <GridItem rowSpan={2} colSpan={2} bg='white' p={2}>
            <Flex alignItems='center'>
              <Text>活動</Text>
              <Spacer />
              <Text>午前：</Text>
              <Input
                placeholder='コーヒー'
                width='60%'
                bg='white'
                type='text'
                id='amWork'
                value={addDailyRecord.amWork}
                onChange={(e) => setAddDailyRecord({ ...addDailyRecord, amWork: e.target.value })}
              />
            </Flex>
          </GridItem>
          <GridItem rowSpan={2} colSpan={2} bg='white' p={2} borderBottom='1px'>
            <Flex alignItems='center'>
              <Spacer />
              <Text>午後：</Text>
              <Input
                placeholder='菓子製造'
                width='60%'
                bg='white'
                type='text'
                id='pmWork'
                value={addDailyRecord.pmWork}
                onChange={(e) => setAddDailyRecord({ ...addDailyRecord, pmWork: e.target.value })}
              />
            </Flex>
          </GridItem>

          {/* 記録 */}
          <GridItem
            rowSpan={1}
            colSpan={1}
            bg='white'
            alignItems='center'
            textAlign='center'
            borderRight='1px'
          >
            ご本人の様子
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} bg='white' alignItems='center' textAlign='center'>
            支援、考察
          </GridItem>
        </Grid>

        <UnorderedList listStyleType='none' ml='0' border='1px' borderBottomRadius='md'>
          {/* {todos.map((todo) => ( */}
          <ListItem key=''>
            <Flex>
              <Box p='2' w='50%' borderRight='1px'>
                テキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入ります
              </Box>
              <Box p='2' w='50%'>
                テキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入ります
              </Box>
            </Flex>
          </ListItem>
          <ListItem key=''>
            <Flex>
              <Box p='2' w='50%' borderRight='1px'>
                テキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入ります
              </Box>
              <Box p='2' w='50%'>
                テキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入ります
              </Box>
            </Flex>
          </ListItem>
          <ListItem key=''>
            <Flex>
              <Box p='2' w='50%' borderRight='1px'>
                テキストが入りますテキストが入りますテキストが入りますテキストが入ります
              </Box>
              <Box p='2' w='50%'></Box>
            </Flex>
          </ListItem>
          <ListItem key=''>
            <Flex>
              <Box p='2' w='50%' borderRight='1px'>
                テキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入ります
              </Box>
              <Box p='2' w='50%'>
                テキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入ります
              </Box>
            </Flex>
          </ListItem>
          {/* ))} */}
        </UnorderedList>
        <Flex p='1'>
          <Spacer />
          <ButtonGroup>
            <Button size='sm' colorScheme='facebook'>
              <AddIcon />
            </Button>
            <Button size='sm' colorScheme='teal'>
              <EditIcon />
            </Button>
          </ButtonGroup>
        </Flex>
        <Flex p='1'>
          <Spacer />
          <ButtonGroup>
            <Button
              size='sm'
              onClick={() => {
                onSubmit(addDailyRecord);
              }}
            >
              保存してカレンダーに戻る
            </Button>
          </ButtonGroup>
        </Flex>
      </Layout>
    </>
  );
}
