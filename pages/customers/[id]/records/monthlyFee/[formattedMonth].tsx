import { Text, Heading, Spinner, Flex, Grid, GridItem, Center, Spacer } from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { type NextRouter, useRouter } from 'next/router';
import { collection, getDocs, Timestamp } from 'firebase/firestore';

import Layout from '@/components/Layout';
import { useContext, useEffect, useState } from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/ja';
dayjs.locale('ja');

import type { CustomerInfoType } from '@/types/customerInfo';
import { fetchCustomer } from '@/utils/fetchCustomer';
import { useDateFormatter } from '@/hooks/useDateFormatter';

export default function RecordMonthPage() {
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);
  const router: NextRouter = useRouter();

  // 利用者情報取得
  const { id: customerId, formattedMonth } = router.query;
  const [customer, setCustomer] = useState<CustomerInfoType | null>(null);

  // 日付情報

  const { date } = router.query as { date: string };
  const { formattedMonthJa } = useDateFormatter(date);

  // 月別工賃表リスト取得

  type DailyRecordData = {
    id: string;
    author: string;
    amWork: string;
    pmWork: string;
    timeAdjustment: {
      amStartTime: Timestamp;
      amFinishTime: Timestamp;
      pmStartTime: Timestamp;
      pmFinishTime: Timestamp;
    };
  };

  const [allRecordData, setAllRecordData] = useState<DailyRecordData[]>([]);

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

      const dailyRecordPromises = dailyRecordsQuerySnapshot.docs.map(async (doc) => {
        const dailyRecordData = doc.data();
        const dailyRecordBasicData = {
          id: doc.id,
          author: dailyRecordData.author || '---',
          amWork: dailyRecordData.amWork || '---',
          pmWork: dailyRecordData.pmWork || '---',
          timeAdjustment: {
            amStartTime:
              dailyRecordData.timeAdjustment?.amStartTime
                ?.toDate()
                .toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) || '---',
            amFinishTime:
              dailyRecordData.timeAdjustment?.amFinishTime
                ?.toDate()
                .toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) || '---',
            pmStartTime:
              dailyRecordData.timeAdjustment?.pmStartTime
                ?.toDate()
                .toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) || '---',
            pmFinishTime:
              dailyRecordData.timeAdjustment?.pmFinishTime
                ?.toDate()
                .toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) || '---',
          },
        };

        return dailyRecordBasicData;
      });

      const recordData = await Promise.all(dailyRecordPromises);
      setAllRecordData(recordData);
    } catch (error) {
      console.error('Error fetching dailyRecordData:', error);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
        {/* タイトル */}
        <Flex align='end' justify='space-between' mb='4'>
          <Heading color='color.sub' as='h2' size='xl' noOfLines={1}>
            {customer?.customerName}さん
          </Heading>
          <Text>{formattedMonthJa}</Text>
        </Flex>

        {/* 工賃表 */}
        <Grid
          // align="center"
          h='50px'
          templateRows='repeat(2, 1fr)'
          templateColumns='repeat(10, 1fr)'
          fontSize={{ base: '12px', md: '16px' }}
        >
          <GridItem
            rowSpan={2}
            colSpan={2}
            bg='color.mainTransparent1'
            p='2px'
            borderTopLeftRadius='8px'
          >
            日付
          </GridItem>
          <GridItem rowSpan={1} colSpan={4} bg='color.mainTransparent2' p='2px'>
            午前
          </GridItem>
          <GridItem
            rowSpan={1}
            colSpan={4}
            bg='color.mainTransparent2'
            p='2px'
            borderTopRightRadius='8px'
          >
            午後
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} p='2px'>
            開始
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} p='2px'>
            終了
          </GridItem>
          <GridItem rowSpan={1} colSpan={2} backgroundColor='gray.100' p='2px'>
            作業内容
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} p='2px'>
            開始
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} p='2px'>
            終了
          </GridItem>
          <GridItem rowSpan={1} colSpan={2} backgroundColor='gray.100' p='2px'>
            作業内容
          </GridItem>
        </Grid>
        {allRecordData.map((dailyRecord, index) => (
          <Grid
            key='index'
            borderColor='#333'
            templateRows='1fr'
            templateColumns='repeat(10, 1fr)'
            fontSize={{ base: '12px', md: '16px' }}
          >
            <GridItem colSpan={2} bg='color.mainTransparent1' p='2px'>
              {dayjs(dailyRecord.id).format('M月D日(ddd)')}
            </GridItem>
            <GridItem rowSpan={1} colSpan={1} p='2px'>
              {dailyRecord.timeAdjustment.amStartTime instanceof Timestamp
                ? dailyRecord.timeAdjustment.amStartTime
                    .toDate()
                    .toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                : dailyRecord.timeAdjustment.amStartTime}
            </GridItem>
            <GridItem rowSpan={1} colSpan={1} p='2px'>
              {dailyRecord.timeAdjustment.amFinishTime instanceof Timestamp
                ? dailyRecord.timeAdjustment.amFinishTime
                    .toDate()
                    .toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                : dailyRecord.timeAdjustment.amFinishTime}
            </GridItem>
            <GridItem rowSpan={1} colSpan={2} backgroundColor='gray.100' p='2px'>
              {dailyRecord.amWork}
            </GridItem>
            <GridItem rowSpan={1} colSpan={1} p='2px'>
              {dailyRecord.timeAdjustment.pmStartTime instanceof Timestamp
                ? dailyRecord.timeAdjustment.pmStartTime
                    .toDate()
                    .toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                : dailyRecord.timeAdjustment.pmStartTime}
            </GridItem>
            <GridItem rowSpan={1} colSpan={1} p='2px'>
              {dailyRecord.timeAdjustment.pmFinishTime instanceof Timestamp
                ? dailyRecord.timeAdjustment.pmFinishTime
                    .toDate()
                    .toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                : dailyRecord.timeAdjustment.pmFinishTime}
            </GridItem>
            <GridItem rowSpan={1} colSpan={2} backgroundColor='gray.100' p='2px'>
              {dailyRecord.pmWork}
            </GridItem>
          </Grid>
        ))}
        <Flex mt='8'>
          <Spacer />
          {/* <Text borderBottom='1px'>出勤日数：{allRecordData.length}日</Text> */}
        </Flex>
      </Layout>
    </>
  );
}
