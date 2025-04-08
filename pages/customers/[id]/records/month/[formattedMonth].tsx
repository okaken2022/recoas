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
  Center,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';
import { collection, getDocs, DocumentData, query, orderBy } from 'firebase/firestore';

import Layout from '@/components/Layout';
import { useContext, useEffect, useState } from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/ja';
dayjs.locale('ja');

import { CustomerInfoType } from '@/types/customerInfo';
import { fetchCustomer } from '@/utils/fetchCustomer';
import TimeAdjustmentBox from '@/components/record_conponents/TimeAdjustmentBox';
import MealAmountBox from '@/components/record_conponents/MealAmountBox';
import { useForm } from 'react-hook-form';
import { Timestamp } from 'firebase/firestore';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';

export default function RecordMonthPage() {
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

  type DailyRecordData = {
    id: string;
    author: string;
    amWork: string;
    pmWork: string;
    timeAdjustment: number;
    singleRecord: DocumentData[];
  };
  const [allRecordData, setAllRecordData] = useState<DailyRecordData[]>([]);

  const { watch, setValue } = useForm({
    defaultValues: {
      timeAdjustment: {
        amStartTime: Timestamp.fromDate(new Date(1970, 0, 1, 9, 15)),
        amFinishTime: Timestamp.fromDate(new Date(1970, 0, 1, 12, 0)),
        pmStartTime: Timestamp.fromDate(new Date(1970, 0, 1, 13, 30)),
        pmFinishTime: Timestamp.fromDate(new Date(1970, 0, 1, 15, 45)),
      },
      mealAmount: 10,
    },
  });

  const fetchData = async () => {
    if (Array.isArray(customerId) || Array.isArray(formattedMonth)) return;
    try {
      const dailyRecordsCollectionRef = collection(
        db,
        'customers',
        customerId ?? '',
        'monthlyRecords',
        formattedMonth ?? '',
        'dailyRecords',
      );
      const dailyRecordsQuerySnapshot = await getDocs(dailyRecordsCollectionRef);

      // dailyRecordsコレクション内の各ドキュメントに対して、singleRecordコレクション内のドキュメントを取得
      const dailyRecordPromises = dailyRecordsQuerySnapshot.docs.map(async (doc) => {
        const dailyRecordData = doc.data();
        const singleRecordCollectionRef = collection(
          db,
          'customers',
          customerId ?? '',
          'monthlyRecords',
          formattedMonth ?? '',
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
      const recordData = await Promise.all(dailyRecordPromises);
      setAllRecordData(recordData);
    } catch (error) {
      console.error('Error fetching dailyRecordData:', error);
    }
  };

  useEffect(() => {
    if (customerId) {
      const id = Array.isArray(customerId) ? customerId[0] : customerId;
      fetchCustomer(id, setCustomer);
      fetchData();
    }
  }, [customerId, formattedMonth]);
  if (!customer || allRecordData.length === 0) {
    return (
      <Center height='100vh'>
        <Spinner color='color.main' size='xl' />
      </Center>
    );
  }

  const handleRecordItemClick = (dailyRecord: DailyRecordData) => {
    router.push({
      pathname: `/customers/${customerId}/records/${dailyRecord.id}/`,
    });
  };

  return (
    <>
      <Layout>
 
          <Heading color='color.sub' as='h2' mb='4' size='xl' noOfLines={1}>
            {customer?.customerName}さん
          </Heading>
          <Flex alignItems='center' mb={4} fontSize={{ base: 'md', md: 'xl' }}>
            <Flex
              alignItems='center'
              onClick={() => {
                const prevMonth = dayjs(formattedMonth as string)
                  .subtract(1, 'month')
                  .format('YYYY-MM');
                router.push(`/customers/${customerId}/records/month/${prevMonth}`);
              }}
              cursor='pointer'
            >
              <ArrowBackIcon mr='1' />
              <Text>前月</Text>
            </Flex>
            <Spacer />
            <Text fontSize='xl'>{dayjs(formattedMonth as string).format('YYYY年M月')}</Text>
            <Spacer />
            <Flex
              alignItems='center'
              onClick={() => {
                const nextMonth = dayjs(formattedMonth as string)
                  .add(1, 'month')
                  .format('YYYY-MM');
                router.push(`/customers/${customerId}/records/month/${nextMonth}`);
              }}
              cursor='pointer'
            >
              <Text>次月</Text>
              <ArrowForwardIcon ml='1' />
            </Flex>
          </Flex>
        {allRecordData.map((dailyRecord, index) => (
          <Flex
            key={index}
            flexDirection='column'
            bg='white'
            p={2}
            my={2}
            onClick={() => handleRecordItemClick(dailyRecord)}
            cursor='pointer'
          >
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
              <GridItem rowSpan={4} colSpan={2} bg='color.mainTransparent1' p={2}>
                <Flex alignItems='center'>
                  <Text mr='8' fontSize={{ base: 'sm', md: 'xl' }}>
                    {dayjs(dailyRecord.id).format('YYYY年M月D日(ddd)')}
                  </Text>
                  {/* 記入者 */}
                  <Text fontSize={{ base: 'sm', md: 'xl' }}>支援員：</Text>
                  <Box bg='white' p='1' borderRadius={4}>
                    <Text size={{ base: 'sm', md: 'md' }}>{dailyRecord.author}</Text>
                  </Box>
                  <Spacer />
                  {/* 活動 */}
                  <Flex alignItems='center' mr='4'>
                    <Text fontSize={{ base: 'sm', md: 'xl' }}>午前：</Text>
                    <Box bg='white' p='1' borderRadius={4}>
                      <Text size={{ base: 'sm', md: 'md' }} bg='white'>
                        {dailyRecord.amWork}
                      </Text>
                    </Box>
                  </Flex>
                  <Flex alignItems='center'>
                    <Text fontSize={{ base: 'sm', md: 'xl' }}>午後：</Text>
                    <Box bg='white' p='1' borderRadius={4}>
                      <Text size={{ base: 'sm', md: 'md' }} bg='white'>
                        {dailyRecord.pmWork}
                      </Text>
                    </Box>
                  </Flex>
                </Flex>
              </GridItem>
              <GridItem rowSpan={2} colSpan={2}>
                <TimeAdjustmentBox
                  timeAdjustment={watch('timeAdjustment')}
                  onChangeTimeAdjustment={(newTimeAdjustment) => {
                    setValue('timeAdjustment', newTimeAdjustment);
                  }}
                />
              </GridItem>
              <GridItem rowSpan={2} colSpan={2}>
                <MealAmountBox
                  mealAmountValue={watch('mealAmount')}
                  onChangeMealAmount={(value) => setValue('mealAmount', value)}
                />
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
              whiteSpace='pre-line'
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
