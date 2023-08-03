import {
  Text,
  Heading,
  Spinner,
  Flex,
  Spacer,
  Badge,
  Box,
  UnorderedList,
  ListItem,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  DocumentData,
  query,
  orderBy,
} from 'firebase/firestore';

import Layout from '@/components/Layout';
import { useContext, useEffect, useState } from 'react';

import axios from 'axios';
import moment from 'moment';
import { EventContentArg } from '@fullcalendar/core';
//momentは削除
import 'moment/locale/ja';
import jaLocale from '@fullcalendar/core/locales/ja';
import { CustomerInfoType } from '@/types/customerInfo';
import CustomerInfo from '@/components/CustomerInfo';
import { fetchCustomer } from '@/utils/fetchCustomer';
import { format } from 'path';

export default function RecordMonthPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<string[]>([]);

  {
    /* ログイン */
  }
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);
  const router: NextRouter = useRouter();

  {
    /* 利用者情報取得 */
  }
  const { id: customerId, formattedMonth } = router.query;
  const [customer, setCustomer] = useState<CustomerInfoType | null>(null);

  {
    /* 月別記録リスト */
  }
  type SingleRecordData = {
    editor: string;
    good: boolean;
    notice: boolean;
    situation: string;
    support: string;
  };

  type DailyRecordData = {
    id: string;
    author: string;
    amWork: string;
    pmWork: string;
    timeAdjustment: number;
    singleRecord: SingleRecordData[];
  };
  const [allRecordData, setAllRecordData] = useState<DailyRecordData[]>([]);

  const fetchData = async () => {
    try {
      // dailyRecordsコレクション内のドキュメントを取得
      const dailyRecordsCollectionRef = collection(
        db,
        'customers',
        customerId as string,
        'monthlyRecords',
        formattedMonth as string,
        'dailyRecords',
      );
      const dailyRecordsQuerySnapshot = await getDocs(dailyRecordsCollectionRef);

      // dailyRecordsコレクション内の各ドキュメントに対して、singleRecordコレクション内のドキュメントを取得
      const dailyRecordPromises = dailyRecordsQuerySnapshot.docs.map(async (doc) => {
        const dailyRecordData = doc.data();
        const singleRecordCollectionRef = collection(
          db,
          'customers',
          customerId as string,
          'monthlyRecords',
          formattedMonth as string,
          'dailyRecords',
          doc.id,
          'singleRecord',
        );
        const singleRecordQuerySnapshot = await getDocs(
          query(singleRecordCollectionRef, orderBy('serialNumber')),
        );
        const singleRecordData = singleRecordQuerySnapshot.docs.map((doc) => doc.data());
        const dailyRecordWithData = {
          author: dailyRecordData.author,
          amWork: dailyRecordData.amWork,
          pmWork: dailyRecordData.pmWork,
          timeAdjustment: dailyRecordData.timeAdjustment,
          singleRecord: singleRecordData,
          id: doc.id,
        };

        return dailyRecordWithData;
      });

      // データをセット
      const aallRecordData = await Promise.all(dailyRecordPromises);
      console.log('テスト', aallRecordData);
      setAllRecordData(allRecordData);
    } catch (error) {
      console.error('Error fetching dailyRecordData:', error);
    }
  };

  useEffect(() => {
    if (customerId) {
      const id = Array.isArray(customerId) ? customerId[0] : customerId;
      fetchCustomer(id, setCustomer);
      console.log(customerId);
      console.log(formattedMonth);
      fetchData();
    }
  }, [customerId, formattedMonth]);
  console.log('記録', allRecordData);
  if (!customer || allRecordData.length === 0) {
    return <Spinner />;
  }

  return (
    <>
      <Layout>
        <Heading color='color.sub' as='h2' mb='4' size='xl' noOfLines={1}>
          {customer?.customerName}さん
        </Heading>
        {allRecordData.map((dailyRecord, index) => (
          <Flex key={index} flexDirection='column' bg='white' p={2} my={2}>
            {/* 基本情報 */}
            <Grid
              h='auto'
              templateRows='repeat(3, 1fr)'
              templateColumns='repeat(2, 1fr)'
              // gap={2}
              border='1px'
              borderTopRadius='md'
            >
              {/* 日付 */}
              <GridItem rowSpan={2} colSpan={2} bg='color.mainTransparent1' p={2}>
                <Flex alignItems='center'>
                  <Text mr='8' fontSize={{ base: 'md', md: 'xl' }}>
                    {moment(dailyRecord.id).format('YYYY年M月D日(ddd)')}
                  </Text>
                  {/* 記入者 */}
                  <Text>支援員：</Text>
                  <Box bg='white' p='1' borderRadius={4}>
                    <Text size={{ base: 'sm', md: 'md' }}>{dailyRecord.author}</Text>
                  </Box>
                  <Spacer />
                  {/* 活動 */}
                  <Flex alignItems='center' mr='4'>
                    <Text>午前：</Text>
                    <Box bg='white' p='1' borderRadius={4}>
                      <Text size={{ base: 'sm', md: 'md' }} bg='white'>
                        {dailyRecord.amWork}
                      </Text>
                    </Box>
                  </Flex>
                  <Flex alignItems='center'>
                    <Text>午後：</Text>
                    <Box bg='white' p='1' borderRadius={4}>
                      <Text size={{ base: 'sm', md: 'md' }} bg='white'>
                        {dailyRecord.pmWork}
                      </Text>
                    </Box>
                  </Flex>
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
            <UnorderedList
              listStyleType='none'
              ml='0'
              border='1px'
              borderBottomRadius='md'
              fontSize={{ base: 'sm', md: 'md' }}
            >
              {dailyRecord.singleRecord.map((record, index) => {
                const backgroundColor = index % 2 === 0 ? 'gray.100' : 'white'; // 背景色を交互に設定
                return (
                  <ListItem key={index} className='record' backgroundColor={backgroundColor}>
                    <Flex pt='2' pr='2'>
                      <Badge ml='2' variant='outline'>
                        {record.editor}
                      </Badge>
                      <Spacer />
                      {record.good && (
                        <Badge ml='2' colorScheme='teal'>
                          Good
                        </Badge>
                      )}
                      {record.notice && (
                        <Badge ml='2' colorScheme='red'>
                          特記事項
                        </Badge>
                      )}
                    </Flex>
                    <Flex>
                      <Box p='2' w='50%' borderRight='1px'>
                        {record.situation}
                      </Box>
                      <Box p='2' w='50%'>
                        {record.support}
                      </Box>
                    </Flex>
                  </ListItem>
                );
              })}
            </UnorderedList>
          </Flex>
        ))}
      </Layout>
    </>
  );
}
