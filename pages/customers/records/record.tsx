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
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';

import Layout from '@/components/Layout';

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useContext, useEffect, useState } from 'react';

import axios from 'axios';
import moment from 'moment';
import { EventContentArg } from '@fullcalendar/core';

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
          }
        );

        // 取得した祝日情報から日付の配列を作成
        const holidays = response.data.items.map((item: any) => moment(item.start.date).format('YYYY-MM-DD'));
  
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
  }
  CalendarPage();

  const renderEventContent = (eventInfo: EventContentArg) => {
    return (
      <div>
        <b>{eventInfo.timeText}</b>
        <p>{eventInfo.event.title}</p>
      </div>
    );
  };

  return (
    <>
      <Layout>
        <Heading color='color.sub' as='h2' mb="8" size='xl' noOfLines={1} >
          田中太郎さん
        </Heading>
        {/* 支援記録 */}
        <Box>
        </Box>
        <Grid
          h="auto"
          templateRows='repeat(7, 1fr)'
          templateColumns='repeat(2, 1fr)'
          // gap={2}
          border='1px'
          rounded='md'
        >
          {/* 午前記録 */}
          <GridItem rowSpan={2} colSpan={2} bg='color.mainTransparent' p={2}>
            <Flex alignItems='center'>
              <Text>2023年6月16日(金)</Text>
              <Spacer />
              <Text>記入者：</Text>
              <Input placeholder='岡田' width='30%' bg="white"/>
            </Flex>
          </GridItem>
          <GridItem rowSpan={2} colSpan={2} bg='white' p={2}>
            <Flex alignItems='center'>
              <Text>活動</Text>
              <Spacer />
              <Text>午前：</Text>
              <Input placeholder='コーヒー' width='60%' bg="white"/>
            </Flex>
          </GridItem>
          <GridItem rowSpan={2} colSpan={2} bg='white' p={2} borderBottom='1px'>
            <Flex alignItems='center'>
              <Spacer />
              <Text>午後：</Text>
              <Input placeholder='菓子製造' width='60%' bg="white"/>
            </Flex>
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} bg='white' alignItems='center' textAlign='center' borderRight='1px' >
            ご本人の様子
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} bg='white' alignItems='center' textAlign='center' >
            支援、考察
          </GridItem>
        </Grid>
        <Flex>
          <Box p='2' border='1px' w='50%'>
          テキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入ります
          </Box>
          <Box p='2' border='1px' w='50%'>
          テキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入ります
          </Box>
        </Flex>

      </Layout>
    </>
  );
}
