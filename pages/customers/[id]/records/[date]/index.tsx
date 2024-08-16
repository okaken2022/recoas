import {
  Heading,
  Spacer,
  Text,
  Box,
  Flex,
  Button,
  useToast,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { AddIcon, ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import type { SingleRecord } from '@/types/record';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import type { CustomerInfoType } from '@/types/customerInfo';
import { fetchCustomer } from '@/utils/fetchCustomer';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { NextPage } from 'next';
import { useDateFormatter } from '@/hooks/useDateFormatter';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import ActivityBox from '@/components/record_conponents/ActivityBox';
import RecordHeader from '@/components/record_conponents/RecordHeader';
import RecordList from '@/components/record_conponents/RecordList';
import TimeAdjustmentBox from '@/components/record_conponents/TimeAdjustmentBox';
import MealAmountBox from '@/components/record_conponents/MealAmountBox';

interface BasicInfoOfRecord {
  author: string;
  amWork: string;
  pmWork: string;
  timeAdjustment: {
    amStartTime: Timestamp;
    amFinishTime: Timestamp;
    pmStartTime: Timestamp;
    pmFinishTime: Timestamp;
  };
  mealAmount: number;
}

const RecordPage: NextPage<{ formattedDateJa: string }> = () => {
  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm<BasicInfoOfRecord>({
    defaultValues: {
      author: '',
      amWork: '',
      pmWork: '',
      timeAdjustment: {
        amStartTime: Timestamp.fromDate(new Date(1970, 0, 1, 9, 15)),
        amFinishTime: Timestamp.fromDate(new Date(1970, 0, 1, 12, 0)),
        pmStartTime: Timestamp.fromDate(new Date(1970, 0, 1, 13, 30)),
        pmFinishTime: Timestamp.fromDate(new Date(1970, 0, 1, 15, 45)),
      },
      mealAmount: 10,
    },
  });
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customer, setCustomer] = useState<CustomerInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [basicInfoOfRecordData, setBasicInfoOfRecordData] = useState<BasicInfoOfRecord | null>(
    null,
  );
  const [singleRecordData, setSingleRecordData] = useState<{ docId: string; data: SingleRecord }[]>(
    [],
  );
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);
  const router = useRouter();
  const { date } = router.query as { date: string };
  const { formattedMonth, formattedDate, formattedDateJa } = useDateFormatter(date);
  const { id: customerId } = router.query as { id: string };

  const toast = useToast();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (customerId) {
      const id = Array.isArray(customerId) ? customerId[0] : customerId;
      fetchCustomer(id, setCustomer);
      fetchBasicRecordInfo();
      fetchSingleRecord();
    }
  }, [customerId, date]); // `date`が変更されたときにデータをフェッチ

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    reset({
      author: '',
      amWork: '',
      pmWork: '',
      timeAdjustment: {
        amStartTime: Timestamp.fromDate(new Date(1970, 0, 1, 9, 15)),
        amFinishTime: Timestamp.fromDate(new Date(1970, 0, 1, 12, 0)),
        pmStartTime: Timestamp.fromDate(new Date(1970, 0, 1, 13, 30)),
        pmFinishTime: Timestamp.fromDate(new Date(1970, 0, 1, 15, 45)),
      },
      mealAmount: 10,
    });
  }, [date, reset]);

  const createBasicInfo: SubmitHandler<BasicInfoOfRecord> = async (data) => {
    console.log('Submitting data:', data); // デバッグ用
    if (!currentUser) return;

    const recordsCollectionRef = collection(
      db,
      'customers',
      customerId as string,
      'monthlyRecords',
      formattedMonth,
      'dailyRecords',
    );
    const dailyDocumentRef = doc(recordsCollectionRef, formattedDate);

    // timeAdjustmentが存在しない場合や一部がundefinedの場合にデフォルト値を設定
    const defaultTimeAdjustment = {
      amStartTime: Timestamp.fromDate(new Date(1970, 0, 1, 9, 15)),
      amFinishTime: Timestamp.fromDate(new Date(1970, 0, 1, 12, 0)),
      pmStartTime: Timestamp.fromDate(new Date(1970, 0, 1, 13, 30)),
      pmFinishTime: Timestamp.fromDate(new Date(1970, 0, 1, 15, 45)),
    };

    const timeAdjustment = {
      amStartTime: data.timeAdjustment?.amStartTime || defaultTimeAdjustment.amStartTime,
      amFinishTime: data.timeAdjustment?.amFinishTime || defaultTimeAdjustment.amFinishTime,
      pmStartTime: data.timeAdjustment?.pmStartTime || defaultTimeAdjustment.pmStartTime,
      pmFinishTime: data.timeAdjustment?.pmFinishTime || defaultTimeAdjustment.pmFinishTime,
    };

    const docData = {
      author: data.author,
      amWork: data.amWork,
      pmWork: data.pmWork,
      timeAdjustment: timeAdjustment,
      mealAmount: data.mealAmount, // 新しく追加
    };

    console.log('Sending data to Firestore:', docData);

    try {
      await setDoc(dailyDocumentRef, docData);
      toast({
        title: '基本情報を保存しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const fetchBasicRecordInfo = async () => {
    setLoading(true); // データフェッチ中にロード状態を表示
    const recordsCollectionRef = collection(
      db,
      'customers',
      customerId as string,
      'monthlyRecords',
      formattedMonth,
      'dailyRecords',
    );
    const dailyDocumentRef = doc(recordsCollectionRef, formattedDate);
    const recordSnapshot = await getDoc(dailyDocumentRef);
    if (recordSnapshot.exists()) {
      const data = recordSnapshot.data() as BasicInfoOfRecord;
      setBasicInfoOfRecordData(data);
      setValue('author', data.author);
      setValue('amWork', data.amWork);
      setValue('pmWork', data.pmWork);
      setValue('timeAdjustment', data.timeAdjustment);
      setValue('mealAmount', data.mealAmount); // 新しく追加
    } else {
      reset(); // データがない場合はフォームをリセット
    }
    setLoading(false);
  };

  const fetchSingleRecord = async () => {
    const singleRecordCollectionRef = collection(
      db,
      'customers',
      customerId as string,
      'monthlyRecords',
      formattedMonth,
      'dailyRecords',
      formattedDate as string,
      'singleRecord',
    );
    const singleRecordQuerySnapshot = await getDocs(
      query(singleRecordCollectionRef, orderBy('serialNumber')),
    );
    const records = singleRecordQuerySnapshot.docs.map((doc) => ({
      docId: doc.id,
      data: doc.data() as SingleRecord,
    }));
    setSingleRecordData(records);
  };

  const navigateToPreviousDay = () => {
    const previousDay = dayjs(formattedDate).subtract(1, 'day').format('YYYY-MM-DD');
    router.push(`/customers/${customerId}/records/${previousDay}`);
  };

  const navigateToNextDay = () => {
    const nextDay = dayjs(formattedDate).add(1, 'day').format('YYYY-MM-DD');
    router.push(`/customers/${customerId}/records/${nextDay}`);
  };

  const goToRecordEditPage = (docId: string) =>
    router.push({
      pathname: `/customers/${customerId}/records/${formattedDate}/edit/`,
      query: { docId },
    });
  const goToRecordCreatePage = () =>
    router.push({
      pathname: `/customers/${customerId}/records/${formattedDate}/create/`,
      query: { formattedDate },
    });
  const returnList = () => router.push(`/customers/${customerId}/`);

  // 並べ替えの順番をFirestoreに保存するロジック
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = singleRecordData.findIndex((record) => record.docId === active.id);
      const newIndex = singleRecordData.findIndex((record) => record.docId === over?.id);

      const newOrder = arrayMove(singleRecordData, oldIndex, newIndex);
      setSingleRecordData(newOrder);

      // 新しい順序を Firestore に保存
      try {
        for (let i = 0; i < newOrder.length; i++) {
          const record = newOrder[i];
          const recordRef = doc(
            db,
            'customers',
            customerId as string,
            'monthlyRecords',
            formattedMonth,
            'dailyRecords',
            formattedDate as string,
            'singleRecord',
            record.docId,
          );

          // serialNumber フィールドを更新
          await updateDoc(recordRef, { serialNumber: i });
        }
        console.log('Order updated successfully in Firestore');
      } catch (error) {
        console.error('Error updating order in Firestore:', error);
      }
    }
  };

  if (loading) {
    return (
      <Center height='100vh'>
        <Spinner color='color.main' size='xl' />
      </Center>
    );
  }

  return (
    <Layout>
      <form onSubmit={handleSubmit(createBasicInfo)}>
        <Heading color='color.sub' as='h2' mb='4' size='xl' noOfLines={1}>
          {customer?.customerName}さん
        </Heading>
        <Flex mt='2' mb={4} fontSize={{ base: 'md', md: 'xl' }}>
          <Flex alignItems='center' onClick={navigateToPreviousDay} cursor='pointer'>
            <ArrowBackIcon mr='1' />
            <Text fontSize='l'>前の日</Text>
          </Flex>
          <Spacer />
          <Text fontSize='l'>{formattedDateJa}</Text>
          <Spacer />
          <Flex alignItems='center' onClick={navigateToNextDay} cursor='pointer'>
            <Text fontSize='l'>次の日</Text>
            <ArrowForwardIcon ml='1' />
          </Flex>
        </Flex>
        <Text color='color.main' fontWeight='bold'>
          ※各記録をタップすると編集できます
        </Text>
        <Box h='auto' border='1px' borderTopRadius='md'>
          <RecordHeader
            formattedDateJa={formattedDateJa}
            authorValue={basicInfoOfRecordData?.author || ''}
            onAuthorChange={(value) => setValue('author', value)}
            authorError={errors.author?.message}
          />
          <ActivityBox
            amWorkValue={basicInfoOfRecordData?.amWork || ''}
            pmWorkValue={basicInfoOfRecordData?.pmWork || ''}
            onChangeAmWork={(value) => setValue('amWork', value)}
            onChangePmWork={(value) => setValue('pmWork', value)}
          />

          <TimeAdjustmentBox
            timeAdjustment={watch('timeAdjustment')}
            onChangeTimeAdjustment={(newTimeAdjustment) => {
              console.log('Updated timeAdjustment:', newTimeAdjustment); // デバッグ用
              setValue('timeAdjustment', newTimeAdjustment);
              // 変更内容をサーバーに保存するロジックをここに追加
            }}
          />
          <MealAmountBox
            mealAmountValue={watch('mealAmount')}
            onChangeMealAmount={(value) => setValue('mealAmount', value)}
          />
          {/* ボタン */}
          <Flex bg='white' p={2} borderBottom='1px' justifyContent='right'>
            <Button colorScheme='facebook' size={{ base: 'xs', md: 'md' }} type='submit'>
              基本情報の保存
            </Button>
          </Flex>
        </Box>

        {/* 記録 */}
        <RecordList
          singleRecordData={singleRecordData}
          goToRecordEditPage={goToRecordEditPage}
          setSingleRecordData={setSingleRecordData} // ここでデータ更新関数を渡す
          handleDragEnd={handleDragEnd} // 並べ替えの終了をハンドリング
        />

        <Flex mt='2'>
          <Button colorScheme='teal' size='sm' onClick={returnList}>
            一覧へ戻る
          </Button>

          <Spacer />

          <Button size='sm' colorScheme='facebook' onClick={() => goToRecordCreatePage()}>
            <AddIcon mr='1' />
            記録を追加
          </Button>
        </Flex>
      </form>
    </Layout>
  );
};

export default RecordPage;
