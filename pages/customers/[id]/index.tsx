import {
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  UnorderedList,
  ListItem,
  Link,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';

import Layout from '@/components/Layout';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useContext, useEffect, useState } from 'react';

import axios from 'axios';

import { EventContentArg } from '@fullcalendar/core';

import jaLocale from '@fullcalendar/core/locales/ja';
import { CustomerInfoType } from '@/types/customerInfo';
import CustomerInfo from '@/components/CustomerInfo';
import { fetchCustomer } from '@/utils/fetchCustomer';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
dayjs.locale('ja');

export default function Customer() {
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
  const { id: customerId } = router.query; // クエリパラメーターからcustomerIdを取得
  const [customer, setCustomer] = useState<CustomerInfoType | null>(null);

  const fetchHolidays = async () => {
    const response = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/ja.japanese%23holiday%40group.v.calendar.google.com/events',
      {
        params: {
          key: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
          timeMin: dayjs().startOf('year').toISOString(),
          timeMax: dayjs().endOf('year').toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        },
      },
    );

    // 取得した祝日情報から日付の配列を作成
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const holidays = response.data.items.map((item: any) =>
      dayjs(item.start.date).format('YYYY-MM-DD'))
      .filter((date: string) => date !== dayjs().set('month', 2).set('date', 3).format('YYYY-MM-DD')); // 3月3日を除外。
      // Todo：休業日の設定方法を変更
    console.log(holidays);
    // 土日と祝日を除いた日付の配列を作成
    const dates = [];
    let currentDate = dayjs().startOf('year');
    console.log(currentDate);
    const endDate = dayjs().endOf('year');
    console.log(endDate);

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
      const dayOfWeek = currentDate.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidays.includes(currentDate.format('YYYY-MM-DD'));
      if (!isWeekend && !isHoliday) {
        dates.push(currentDate.format('YYYY-MM-DD'));
      }
      currentDate = currentDate.add(1, 'day');
    }
    console.log(dates);

    // 日付ごとにイベントオブジェクトを作成
    const newEvents: Event[] = dates.map((date) => ({
      title: '',
      start: date,
    }));

    setEvents(newEvents);
  };

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
    const clickedMonth = dayjs(clickedDate).format('YYYY-MM'); // クリックされた日付から年月を取得
    const formattedDate = dayjs(clickedDate).format('YYYY-MM-DD'); //日付の文字列
    // ルーティング先のパスを指定し、日付情報をクエリパラメータとして渡す
    router.push({
      pathname: `/customers/${customerId}/records/${formattedDate}/`, // ルーティング先のパスを指定
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

  {
    /* 月別記録リスト */
  }
  const fetchMonthlyRecords = async () => {
    // Firestoreのコレクションを作成
    const recordsCollectionRef = collection(
      db,
      'customers',
      customerId as string,
      'monthlyRecords',
    );

    // コレクション内のドキュメントを取得
    const querySnapshot = await getDocs(recordsCollectionRef);

    // ドキュメントが存在する月のリストを取得
    const records: string[] = querySnapshot.docs.map((doc) => doc.id);

    setMonthlyRecords(records);
  };

  const handleMonthlyItemClick = (formattedMonth: string) => {
    router.push(`/customers/${customerId}/records/month/${formattedMonth}/`);
  };

  const handleMonthlyFeeClick = (formattedMonth: string) => {
    router.push(`/customers/${customerId}/records/monthlyFee/${formattedMonth}/`);
  };

  const formatJapaneseMonth = (formattedMonth: string) => {
    const date = dayjs(formattedMonth, 'YYYY-MM');
    return date.format('YYYY年M月');
  };

  useEffect(() => {
    if (customerId) {
      const id = Array.isArray(customerId) ? customerId[0] : customerId;
      fetchCustomer(id, setCustomer);
      fetchHolidays();
      fetchMonthlyRecords();
    }
  }, [customerId]);

  if (!customer) {
    return (
      <Center height='100vh'>
        <Spinner color='color.main' size='xl' />
      </Center>
    );
  }

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
            <Tab>工賃表</Tab>
            <Tab>記録月別リスト</Tab>
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
              <UnorderedList>
                {monthlyRecords.map((month) => (
                  <ListItem key={month}>
                    {/* リンクを追加 */}
                    <Link
                      onClick={() => handleMonthlyFeeClick(month)}
                      style={{ cursor: 'pointer' }}
                    >
                      {formatJapaneseMonth(month)}
                    </Link>
                  </ListItem>
                ))}
              </UnorderedList>
            </TabPanel>
            <TabPanel>
              <UnorderedList>
                {monthlyRecords.map((month) => (
                  <ListItem key={month}>
                    {/* リンクを追加 */}
                    <Link
                      onClick={() => handleMonthlyItemClick(month)}
                      style={{ cursor: 'pointer' }}
                    >
                      {formatJapaneseMonth(month)}
                    </Link>
                  </ListItem>
                ))}
              </UnorderedList>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Layout>
    </>
  );
}
