import { Heading, Spacer, VStack, Text } from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';

import Layout from '@/components/Layout';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useContext, useEffect, useState } from 'react';

import axios from 'axios';
import moment from 'moment';
import { EventContentArg } from '@fullcalendar/core';
import 'moment/locale/ja';
import jaLocale from '@fullcalendar/core/locales/ja';

export default function Home() {
  {
    /* ログイン */
  }
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);
  const router: NextRouter = useRouter();

  {
    /* FullCalendar 土日祝日を除いた日付をイベントとして配列を作成 */
  }
  interface Event {
    title: string;
    start: string;
  }
  const [events, setEvents] = useState<Event[]>([]);

  const CalendarPage = () => {
    useEffect(() => {
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
          title: 'Event',
          start: date,
        }));

        setEvents(newEvents);
      };

      fetchHolidays();
    }, []);
  };
  
  CalendarPage();

  const handleEventClick = (eventInfo: EventContentArg) => {
    const clickedDate = eventInfo.event.start; // クリックされたイベントの日付を取得

    // ルーティング先のパスを指定し、日付情報をクエリパラメータとして渡す
    router.push(`/customers/records/dailyRecord/?date=${clickedDate}`);
  };


  //カレンダー設定で指定した閉所日を、イベント一覧の配列から削除し、新たな配列を作成。その後カレンダーに表示。

  const renderEventContent = (eventInfo: EventContentArg) => {
    return (
      <div>
        <b>{eventInfo.timeText}</b>
        <p style={{ backgroundColor: 'skyblue', padding: '2px',  cursor: 'pointer' }}
            onClick={() => handleEventClick(eventInfo)}>{eventInfo.event.title}</p>
      </div>
    );
  };

  return (
    <>
      <Layout>
        <Heading color='color.sub' as='h2' mb='8' size='xl' noOfLines={1}>
          田中太郎さん
        </Heading>
        {/* 支援目標 */}
        <Text fontSize='2xl'>支援目標</Text>
        <VStack
          align='start'
          w='100%'
          h='auto'
          m='auto'
          mt='4'
          mb='20'
          p='4'
          border='1px'
          rounded='md'
          color='#333'
        >
          <Text fontSize='xl'>1.日常生活のスキルの向上</Text>
          <Text>
            田中さんの日常生活スキルを向上させることを目標とします。具体的な目標としては、自己介助の能力の向上、食事の準備や清掃などの家事スキルの習得を挙げます。
          </Text>
          <Spacer />
          <Text fontSize='xl'>2.コミュニケーション能力の向上</Text>
          <Text>
            田中さんのコミュニケーション能力を向上させ、社会参加を促進します。具体的な目標としては、日常会話のスキルの向上、表現力や聴取能力の向上を挙げます。
          </Text>
        </VStack>

        {/* 利用日カレンダー */}
        <Text fontSize='2xl'>利用日カレンダー</Text>

        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView='dayGridMonth'
          events={events}
          eventContent={renderEventContent}
          locale={jaLocale} // FullCalendarの日本語表示
        />
      </Layout>
    </>
  );
}
