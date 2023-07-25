import {
  Text,
  Heading,
  Spinner
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
// dailyRecordDataの型定義を修正
const [dailyRecordData, setDailyRecordData] = useState<{ singleRecord: DocumentData[]; }[]>([]);

  const fetchData = async () => {
    try {
      // dailyRecordsコレクション内のドキュメントを取得
      const dailyRecordsCollectionRef = collection(
        db,
        'customers',
        customerId as string,
        'monthlyRecords',
        formattedMonth as string,
        'dailyRecords'
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
          'singleRecord'
          );
          const singleRecordQuerySnapshot = await getDocs(singleRecordCollectionRef);
        const singleRecordData = singleRecordQuerySnapshot.docs.map((doc) => doc.data());
        return { ...dailyRecordData, singleRecord: singleRecordData };
      });

      // データをセット
      const dailyRecordData = await Promise.all(dailyRecordPromises);
      setDailyRecordData(dailyRecordData);

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
  console.log(dailyRecordData);
  if (!customer || dailyRecordData.length === 0) {
    return <Spinner />; 
  }

  return (
    <>
      <Layout>
        <Heading className='title' color='color.sub' as='h2' mb='8' size='xl' noOfLines={1}>
          {customer.customerName}さん
        </Heading>

        {/* 利用日カレンダー */}
        <Text className='head' fontSize='2xl' mb='4'>
          記録一覧
        </Text>
        
      </Layout>
    </>
  );
}