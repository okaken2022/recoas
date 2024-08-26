import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useToast,
  VStack,
  Text,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { collection, addDoc, getDocs, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/hooks/firebase'; // Firestoreインスタンスをインポート
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface ClosedDayFormInputs {
  startOfClosedDay: string; // YYYY-MM-DD形式の文字列
  endOfClosedDay: string; // YYYY-MM-DD形式の文字列
}

interface ClosedDay {
  id: string;
  startOfClosedDay: Timestamp;
  endOfClosedDay: Timestamp;
}

const ClosedDaysAdminPage: React.FC = () => {
  const { register, handleSubmit, reset } = useForm<ClosedDayFormInputs>();
  const [closedDays, setClosedDays] = useState<ClosedDay[]>([]); // 休業日のリストを保持
  const toast = useToast();
  const router = useRouter();

  const onSubmit: SubmitHandler<ClosedDayFormInputs> = async (data) => {
    try {
      const startOfClosedDay = Timestamp.fromDate(new Date(data.startOfClosedDay));
      const endOfClosedDay = Timestamp.fromDate(new Date(data.endOfClosedDay));

      await addDoc(collection(db, 'closedDays'), {
        startOfClosedDay,
        endOfClosedDay,
      });

      toast({
        title: '休業日が設定されました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      reset();
      fetchClosedDays(); // 新しい休業日を追加した後にリストを更新
    } catch (error) {
      toast({
        title: '休業日の設定に失敗しました。',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error adding document: ', error);
    }
  };

  const fetchClosedDays = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, 'closedDays'));
    const days: ClosedDay[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      startOfClosedDay: doc.data().startOfClosedDay,
      endOfClosedDay: doc.data().endOfClosedDay,
    }));

    // 日付順にソート
    const sortedDays = days.sort((a, b) =>
      dayjs(a.startOfClosedDay.toDate()).isBefore(dayjs(b.startOfClosedDay.toDate())) ? -1 : 1,
    );

    setClosedDays(sortedDays);
  }, []);

  useEffect(() => {
    fetchClosedDays();
  }, [fetchClosedDays]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'closedDays', id));
      toast({
        title: '休業日が削除されました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchClosedDays(); // 休業日を削除した後にリストを更新
    } catch (error) {
      toast({
        title: '休業日の削除に失敗しました。',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error deleting document: ', error);
    }
  };

  useEffect(() => {
    fetchClosedDays(); // コンポーネントのマウント時に休業日を取得
  }, [fetchClosedDays]);

  return (
    <Layout>
      <Flex justifyContent='center' flexDirection='column'>
        <Text className='head' fontSize='2xl'>
          休業日の設定
        </Text>
        <VStack spacing={4} mt='20px' mb='40px'>
          <Box as='form' onSubmit={handleSubmit(onSubmit)} width='100%'>
            <FormControl id='startOfClosedDay' isRequired>
              <FormLabel>休業開始日</FormLabel>
              <Input type='date' {...register('startOfClosedDay', { required: true })} />
            </FormControl>
            <FormControl id='endOfClosedDay' isRequired mt={4}>
              <FormLabel>休業終了日</FormLabel>
              <Input type='date' {...register('endOfClosedDay', { required: true })} />
            </FormControl>
            <Button mt={6} colorScheme='blue' type='submit' width='full'>
              休業日を設定
            </Button>
          </Box>
        </VStack>

        {/* 休業日の一覧を表示 */}
        <Text className='head' fontSize='2xl'>
          設定された休業日
        </Text>
        <Box>
          <UnorderedList mt={6} styleType='none'>
            {closedDays.map((day) => (
              <ListItem key={day.id} mb={2}>
                <Flex justify='space-between' align='center' py={2} borderBottom='1px solid #ddd'>
                  <Text>
                    {dayjs(day.startOfClosedDay.toDate()).format('YYYY-MM-DD') ===
                    dayjs(day.endOfClosedDay.toDate()).format('YYYY-MM-DD')
                      ? dayjs(day.startOfClosedDay.toDate()).format('YYYY-MM-DD')
                      : `${dayjs(day.startOfClosedDay.toDate()).format('YYYY-MM-DD')} 〜 ${dayjs(
                          day.endOfClosedDay.toDate(),
                        ).format('YYYY-MM-DD')}`}
                  </Text>
                  <Button colorScheme='red' size='sm' onClick={() => handleDelete(day.id)}>
                    削除
                  </Button>
                </Flex>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      </Flex>
    </Layout>
  );
};

export default ClosedDaysAdminPage;
