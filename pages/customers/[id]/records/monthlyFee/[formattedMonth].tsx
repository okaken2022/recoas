import {
  Text,
  Heading,
  Spinner,
  Flex,
  Grid,
  GridItem,
  Center,
  Box,
  Spacer,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';
import { collection, getDocs } from 'firebase/firestore';

import Layout from '@/components/Layout';
import { useContext, useEffect, useState } from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/ja';
dayjs.locale('ja');

import { CustomerInfoType } from '@/types/customerInfo';
import { fetchCustomer } from '@/utils/fetchCustomer';
import { useDateFormatter } from '@/hooks/useDateFormatter';

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
    /* 日付情報 */
  }
  const { date } = router.query as { date: string };
  const { formattedMonthJa } = useDateFormatter(date);

  {
    /* 月別工賃表リスト取得 */
  }
  type DailyRecordData = {
    id: string;
    author: string;
    amWork: string;
    pmWork: string;
    timeAdjustment: {
      amStartTimeHours: number;
      amStartTimeMinutes: number;
      amFinishTimeHours: number;
      amFinishTimeMinutes: number;
      pmStartTimeHours: number;
      pmStartTimeMinutes: number;
      pmFinishTimeHours: number;
      pmFinishTimeMinutes: number;
    };
  };

  const [allRecordData, setAllRecordData] = useState<DailyRecordData[]>([]);

  const fetchData = async () => {
    if (Array.isArray(customerId) || Array.isArray(formattedMonth)) return;
    try {
      // dailyRecordsコレクション内のドキュメントを取得
      // as string はできるだけ使わない。関数で型ガードするのがベター？if文使うか、
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
        const dailyRecordBasicData = {
          id: doc.id,
          author: dailyRecordData.author,
          amWork: dailyRecordData.amWork,
          pmWork: dailyRecordData.pmWork,
          timeAdjustment: {
            amStartTimeHours: dailyRecordData.timeAdjustment.amStartTimeHours,
            amStartTimeMinutes: dailyRecordData.timeAdjustment.amStartTimeMinutes,
            amFinishTimeHours: dailyRecordData.timeAdjustment.amFinishTimeHours,
            amFinishTimeMinutes: dailyRecordData.timeAdjustment.amFinishTimeMinutes,
            pmStartTimeHours: dailyRecordData.timeAdjustment.pmStartTimeHours,
            pmStartTimeMinutes: dailyRecordData.timeAdjustment.pmStartTimeMinutes,
            pmFinishTimeHours: dailyRecordData.timeAdjustment.pmFinishTimeHours,
            pmFinishTimeMinutes: dailyRecordData.timeAdjustment.pmFinishTimeMinutes,
          },
        };

        return dailyRecordBasicData;
      });

      // データをセット
      const recordData = await Promise.all(dailyRecordPromises);
      setAllRecordData(recordData);
    } catch (error) {
      console.error('Error fetching dailyRecordData:', error);
    }
  };

  // dailyRecord.timeAdjustment.amStartTimeMinutesを0埋めして表示する関数
  const formatMinutes = (minutes: number) => {
    // 2桁の文字列に変換し、0で埋める
    return String(minutes).padStart(2, '0');
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
          border='1px'
          h='50px'
          templateRows='repeat(2, 1fr)'
          templateColumns='repeat(10, 1fr)'
        >
          <GridItem rowSpan={2} colSpan={2} bg='color.mainTransparent1' border='1px'>
            日付
          </GridItem>
          <GridItem rowSpan={1} colSpan={4} bg='color.mainTransparent2' border='1px'>
            午前
          </GridItem>
          <GridItem rowSpan={1} colSpan={4} bg='color.mainTransparent2' border='1px'>
            午後
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} borderRight='1px' borderLeft='1px'>
            開始
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} borderRight='1px'>
            終了
          </GridItem>
          <GridItem rowSpan={1} colSpan={2} borderRight='1px'>
            作業内容
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} borderRight='1px' borderLeft='1px'>
            開始
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} borderRight='1px'>
            終了
          </GridItem>
          <GridItem rowSpan={1} colSpan={2} borderRight='1px'>
            作業内容
          </GridItem>
        </Grid>
        {allRecordData.map((dailyRecord, index) => (
          <Grid
            key='index'
            border='1px'
            borderColor='#333'
            templateRows='1fr'
            templateColumns='repeat(10, 1fr)'
          >
            <GridItem colSpan={2} bg='color.mainTransparent1'>
              {dayjs(dailyRecord.id).format('M月D日(ddd)')}
            </GridItem>
            <GridItem rowSpan={1} colSpan={1} borderRight='1px' borderLeft='1px'>
              {dailyRecord.timeAdjustment.amStartTimeHours}:
              {dailyRecord.timeAdjustment.amStartTimeMinutes}
              {/* {formatMinutes(dailyRecord.timeAdjustment.amStartTimeMinutes)} */}
            </GridItem>
            <GridItem rowSpan={1} colSpan={1} borderRight='1px'>
              {dailyRecord.timeAdjustment.amFinishTimeHours}:
              {dailyRecord.timeAdjustment.amFinishTimeMinutes}
              {/* {formatMinutes(dailyRecord.timeAdjustment.amFinishTimeMinutes)} */}
            </GridItem>
            <GridItem rowSpan={1} colSpan={2} borderRight='1px'>
              {dailyRecord.amWork}
            </GridItem>
            <GridItem rowSpan={1} colSpan={1} borderRight='1px' borderLeft='1px'>
              {dailyRecord.timeAdjustment.pmStartTimeHours}:
              {dailyRecord.timeAdjustment.pmStartTimeMinutes}
              {/* {formatMinutes(dailyRecord.timeAdjustment.pmStartTimeMinutes)} */}
            </GridItem>
            <GridItem rowSpan={1} colSpan={1} borderRight='1px'>
              {dailyRecord.timeAdjustment.pmFinishTimeHours}:
              {dailyRecord.timeAdjustment.pmFinishTimeMinutes}
              {/* {formatMinutes(dailyRecord.timeAdjustment.pmFinishTimeMinutes)} */}
            </GridItem>
            <GridItem rowSpan={1} colSpan={2} borderRight='1px'>
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
