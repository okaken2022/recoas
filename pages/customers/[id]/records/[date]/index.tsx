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
import { NextRouter, useRouter } from 'next/router';

import Layout from '@/components/Layout';
import { useContext, useEffect, useState } from 'react';

import dayjs from 'dayjs';

import { AddIcon, ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { BasicInfoOfRecord, SingleRecord } from '@/types/record';
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { CustomerInfoType } from '@/types/customerInfo';
import { fetchCustomer } from '@/utils/fetchCustomer';
import { SubmitHandler, useForm } from 'react-hook-form';
import { NextPage } from 'next';
import { useDateFormatter } from '@/hooks/useDateFormatter';
import RecordHeader from '@/components/record_conponents/RecordHeader';
import ActivityBox from '@/components/record_conponents/ActivityBox';
import TimeAdjustmentBox from '@/components/record_conponents/TimeAdjustmentBox';
import RecordList from '@/components/record_conponents/RecordList';

const RecordPage: NextPage<{ formattedDateJa: string }> = () => {
  {
    /* useForm */
  }
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BasicInfoOfRecord>();

  {
    /* modal, toast */
  }
  const toast = useToast();
  {
    /* state */
  }
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customer, setCustomer] = useState<CustomerInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [basicInfoOfRecordData, setbasicInfoOfRecordData] = useState<BasicInfoOfRecord | null>(
    null,
  );
  const [singleRecordData, setSingleRecordData] = useState<{ docId: string; data: SingleRecord }[]>(
    [],
  );

  {
    /* ログイン */
  }
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);

  const router: NextRouter = useRouter();

  {
    /* 日付情報 */
  }
  const { date } = router.query as { date: string };
  const { formattedMonth, formattedDate, formattedDateJa } = useDateFormatter(date);

  {
    /* 利用者情報取得 */
  }
  const { id: customerId } = router.query as { id: string }; // クエリパラメーターからcustomerIdを取得

  useEffect(() => {
    if (customerId) {
      const id = Array.isArray(customerId) ? customerId[0] : customerId;
      fetchCustomer(id, setCustomer);
      fetchBasicRecordInfo();
      fetchSingleRecord();
    }
  }, [customerId, setValue, formattedDate]);

  {
    /* 基本情報保存 */
  }
  const createBasicInfo = async (
    author: string,
    amWork: string,
    pmWork: string,
    timeAdjustment: number,
  ) => {
    if (!currentUser) return;
    console.log('onSubmit fired2');
    const recordsCollectionRef = collection(
      db,
      'customers',
      customerId as string,
      'monthlyRecords',
      formattedMonth,
      'dailyRecords',
    );
    const dailyDocumentRef = doc(recordsCollectionRef, formattedDate);
    const monthSnapshot = await getDoc(dailyDocumentRef);
    const data = {
      author: author,
      amWork: amWork,
      pmWork: pmWork,
      timeAdjustment: timeAdjustment,
    };
    await setDoc(dailyDocumentRef, data);
    console.log('データが更新されました');
  };

  const onSubmitBasicInfo: SubmitHandler<BasicInfoOfRecord> = async (data) => {
    try {
      await createBasicInfo(data.author, data.amWork, data.pmWork, data.timeAdjustment);
      toast({
        title: '基本情報を保存しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: '保存に失敗しました。',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  {
    /* 基本情報取得 */
  }
  const fetchBasicRecordInfo = async () => {
    // if (!currentUser) return;
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
      setbasicInfoOfRecordData(data);

      // フォームの各フィールドに値を設定
      setValue('author', data.author);
      setValue('amWork', data.amWork);
      setValue('pmWork', data.pmWork);
      setValue('timeAdjustment', data.timeAdjustment);
    }

    setLoading(false);
  };

  {
    /* 時間変更のラジオボタン */
  }
  const handleRadioChange = (value: string) => {
    setIsCustomTime(value === '変更');
  };

  const returnList = () => {
    router.push({
      pathname: `/customers/${customerId}/`,
    });
  };

  {
    /* singleRecord取得 */
  }
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

    const records = singleRecordQuerySnapshot.docs.map((doc) => {
      const docId = doc.id;
      const data = doc.data() as SingleRecord;
      return { docId, data };
    });

    setSingleRecordData(records);
  };

  {
    /* ルーティング */
  }
  const navigateToPreviousDay = () => {
    const prevDate = dayjs(formattedDate).subtract(1, 'day').format('YYYY-MM-DD');
    router.push(`/customers/${customerId}/records/${prevDate}`);
  };

  const navigateToNextDay = () => {
    const nextDate = dayjs(formattedDate).add(1, 'day').format('YYYY-MM-DD');
    router.push(`/customers/${customerId}/records/${nextDate}`);
  };

  const goToRecordEditPage = (docId: string) => {
    router.push({
      pathname: `/customers/${customerId}/records/${formattedDate}/edit/`,
      query: { docId: docId },
    });
  };

  const goToRecordCreatePage = () => {
    router.push({
      pathname: `/customers/${customerId}/records/${formattedDate}/create/`,
      query: { formattedDate: formattedDate },
    });
  };

  if (!singleRecordData) {
    return (
      <Center height='100vh'>
        <Spinner color='color.main' size='xl' />
      </Center>
    );
  }
console.log(basicInfoOfRecordData)
  return (
    <>
      <Layout>
        <form>
          <Heading color='color.sub' as='h2' mb='4' size='xl' noOfLines={1}>
            {customer?.customerName}さん
          </Heading>
          {/* ページネーション */}
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
          <Text color='color.main' fontWeight={'bold'}>
            ※各記録をタップすると編集できます
          </Text>

          {/* 基本情報 */}
          <Box h='auto' border='1px' borderTopRadius='md'>
            {/* Record Header */}
            <RecordHeader
              formattedDateJa={formattedDateJa}
              authorValue={basicInfoOfRecordData?.author || ''}
              onAuthorChange={(value) => setValue('author', value)}
              authorError={errors.author && errors.author.message}
            />
            {/* 活動 */}
            <ActivityBox
              amWorkValue={basicInfoOfRecordData?.amWork || ''}
              pmWorkValue={basicInfoOfRecordData?.pmWork || ''}
              onChangeAmWork={(value) => setValue('amWork', value)}
              onChangePmWork={(value) => setValue('pmWork', value)}
            />
            {/* 作業時間 */}
            <TimeAdjustmentBox
              isCustomTime={isCustomTime}
              onRadioChange={handleRadioChange}
              onChangeTimeAdjustment={(value) => setValue('timeAdjustment', value)}
              timeAdjustmentValue={basicInfoOfRecordData?.timeAdjustment || undefined}
            />

            {/* ボタン */}
            <Flex bg='white' p={2} borderBottom='1px' justifyContent='right'>
              <Button
                colorScheme='facebook'
                size={{ base: 'xs', md: 'md' }}
                onClick={handleSubmit(onSubmitBasicInfo)}
              >
                基本情報の保存
              </Button>
            </Flex>
          </Box>

          {/* 記録 */}
          <RecordList singleRecordData={singleRecordData} goToRecordEditPage={goToRecordEditPage} />

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
    </>
  );
};

export default RecordPage;
