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
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Td,
  Tfoot,
  Th,
  Tbody,
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
import { BasicInfoOfRecord } from '@/types/record';
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
  const { formattedDate, formattedMonthJa } = useDateFormatter(date);

  {
    /* 月別記録リスト */
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
            pmFinishTimeMinutes: dailyRecordData.timeAdjustment.pmFinishTimeMinutes
          }
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
          <GridItem rowSpan={1} colSpan={1} borderRight='1px' borderLeft='1px'>開始時間</GridItem>
          <GridItem rowSpan={1} colSpan={1} borderRight='1px'>終了時間</GridItem>
          <GridItem rowSpan={1} colSpan={2} borderRight='1px'>作業内容</GridItem>
          <GridItem rowSpan={1} colSpan={1} borderRight='1px' borderLeft='1px'>開始時間</GridItem>
          <GridItem rowSpan={1} colSpan={1} borderRight='1px'>終了時間</GridItem>
          <GridItem rowSpan={1} colSpan={2} borderRight='1px'>作業内容</GridItem>
        </Grid>
        {allRecordData.map((dailyRecord, index) => 
          <Flex key="index">
            <Text align="center" w="100%" backgroundColor="gray.200" border='1px'>日付</Text>
          </Flex>
        )}
      </Layout>
    </>
  );
}
