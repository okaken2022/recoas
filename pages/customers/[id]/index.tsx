import {
  Heading,
  Spacer,
  VStack,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  DocumentData,
} from 'firebase/firestore';

import Layout from '@/components/Layout';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useContext, useEffect, useState } from 'react';

import axios from 'axios';
import moment from 'moment';
import { EventContentArg } from '@fullcalendar/core';
import 'moment/locale/ja';
import jaLocale from '@fullcalendar/core/locales/ja';
import { CustomerInfoType } from '@/types/customerInfo';
import CustomerInfo from '@/components/CustomerInfo';
import { fetchCustomer } from '@/utils/fetchCustomer';

export default function Customer() {
  const [events, setEvents] = useState<Event[]>([]);

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
  const { id: customerId } = router.query; // クエリパラメーターからcustomerIdを取得
  const [customer, setCustomer] = useState<CustomerInfoType | null>(null);

  const fetchHolidays = async () => {
    // Google Calendar APIで祝日情報を取得
    const response = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/ja.japanese%23holiday%40group.v.calendar.google.com/events',
      {
        params: {
          key: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
          timeMin: moment().startOf('year').toISOString(),
          timeMax: moment().endOf('year').toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        },
      },
    );

    // 取得した祝日情報から日付の配列を作成
    const holidays = response.data.items.map((item: any) =>
      moment(item.start.date).format('YYYY-MM-DD'),
    );

    // 土日と祝日を除いた日付の配列を作成
    const dates = [];
    const currentDate = moment().startOf('year');
    const endDate = moment().endOf('year');
    while (currentDate.isSameOrBefore(endDate)) {
      const dayOfWeek = currentDate.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidays.includes(currentDate.format('YYYY-MM-DD'));
      if (!isWeekend && !isHoliday) {
        dates.push(currentDate.format('YYYY-MM-DD'));
      }
      currentDate.add(1, 'day');
    }

    // 日付ごとにイベントオブジェクトを作成
    const newEvents: Event[] = dates.map((date) => ({
      title: '',
      start: date,
    }));

    setEvents(newEvents);
  };

  useEffect(() => {
    if (customerId) {
      const id = Array.isArray(customerId) ? customerId[0] : customerId;
      fetchCustomer(id, setCustomer);
      fetchHolidays();
    }
  }, [customerId]);

  if (!customer) {
    return <div>Loading...</div>;
  }

  {
    /* FullCalendar 土日祝日を除いた日付をイベントとして配列を作成 */
  }
  interface Event {
    title: string;
    start: string;
  }

  {
    /* FullCalendar 月別のコレクション追加 */
  }
  const handleEventClick = async (eventInfo: EventContentArg) => {
    const clickedDate = eventInfo.event.start as Date; // クリックされたイベントの日付を取得
    const clickedMonth = moment(clickedDate).format('YYYY-MM'); // クリックされた日付から年月を取得

    // ルーティング先のパスを指定し、日付情報をクエリパラメータとして渡す
    router.push({
      pathname: `/customers/${customerId}/records/`, // ルーティング先のパスを指定
      query: { date: clickedDate.toISOString() }, // クエリパラメータとして日付情報を渡す
    });

    // Firestoreのコレクションを作成
    const db = getFirestore();
    const recordsCollectionRef = collection(
      db,
      'customers',
      customerId as string,
      'monthlyRecords',
    );
    const monthDocumentRef = doc(recordsCollectionRef, clickedMonth);

    // コレクションが存在しない場合のみ追加
    const monthSnapshot = await getDoc(monthDocumentRef);
    if (!monthSnapshot.exists()) {
      await setDoc(monthDocumentRef, {});
    }
  };

  //カレンダー設定で指定した閉所日を、イベント一覧の配列から削除し、新たな配列を作成。その後カレンダーに表示。

  const renderEventContent = (eventInfo: EventContentArg) => {
    return (
      <div>
        <b>{eventInfo.timeText}</b>
        <p
          style={{ backgroundColor: 'skyblue', height: '50px', cursor: 'pointer' }}
          onClick={() => handleEventClick(eventInfo)}
        >
          {eventInfo.event.title}
        </p>
      </div>
    );
  };

  return (
    <>
      <Layout>
        <CustomerInfo customer={customer} />

        {/* 利用日カレンダー */}
        <Text className='head' fontSize='2xl' mb='4'>
          記録一覧
        </Text>
        <Tabs size='md' variant='enclosed'>
          <TabList>
            <Tab>カレンダー</Tab>
            <Tab>リスト表示</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView='dayGridMonth'
                events={events}
                eventContent={renderEventContent}
                locale={jaLocale} // FullCalendarの日本語表示
              />
            </TabPanel>
            <TabPanel>
              <p>リスト表示予定</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Layout>
    </>
  );
}
