import {
  Heading,
  Spacer,
  Box,
  Flex,
  Button,
  Checkbox,
  Stack,
  useDisclosure,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';

import Layout from '@/components/Layout';

import { useContext, useEffect, useState } from 'react';
import ResizeTextarea from 'react-textarea-autosize';

import moment from 'moment';
import { BasicInfoOfRecord, SingleRecord } from '@/types/record';
import { DocumentData, addDoc, collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { CustomerInfoType } from '@/types/customerInfo';
import { fetchCustomer } from '@/utils/fetchCustomer';
import { SubmitHandler, useForm } from 'react-hook-form';
import Link from 'next/link';

export default function RecordPage() {
  {
    /* useForm */
  }
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
    reset,
  } = useForm<SingleRecord>();

  {
    /* toast */
  }
  const toast = useToast();
  {
    /* state */
  }
  const [customer, setCustomer] = useState<CustomerInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [basicInfoOfRecordData, setbasicInfoOfRecordData] = useState<BasicInfoOfRecord | null>(
    null,
  );
  const [singleRecordData, setSingleRecordData] = useState<
    { docId: string; data: DocumentData }[] | null
  >(null);

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
  const formattedDateJa = moment(date).format('YYYY年M月D日 (ddd)'); //日本語表記の文字列
  const formattedMonth = moment(date).format('YYYY-MM'); //月の文字列
  const formattedDate = moment(date).format('YYYY-MM-DD'); //日付の文字列
  console.log(formattedDate);

  {
    /* 利用者情報取得 */
  }
  const { id: customerId } = router.query as { id: string }; // クエリパラメーターからcustomerIdを取得

  useEffect(() => {
    if (customerId) {
      const id = Array.isArray(customerId) ? customerId[0] : customerId;
      fetchCustomer(id, setCustomer);
      fetchSingleRecord();
    }
  }, [customerId, singleRecordData, setValue]);
  console.log(customerId);

  {
    /* singleRecord取得 */
  }
  const fetchSingleRecord = async () => {
    if (!currentUser) return;
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
    const singleRecordQuerySnapshot = await getDocs(singleRecordCollectionRef);

    singleRecordQuerySnapshot.forEach((doc) => {
      const docId = doc.id;
      const data = doc.data();
      setSingleRecordData([{ docId, data }]);
    });
  };

  {
    /* singleRecord編集、保存 */
  }

  const onSubmitSingleRecord: SubmitHandler<SingleRecord> = async (data) => {
    console.log('発火');
    try {
      if (singleRecordData) {
        const { docId } = singleRecordData[0];
        const singleRecordDocumentRef = doc(
          db,
          'customers',
          customerId as string,
          'monthlyRecords',
          formattedMonth,
          'dailyRecords',
          formattedDate,
          'singleRecord',
          docId,
        );
        await setDoc(singleRecordDocumentRef, data);
        toast({
          title: '記録を保存しました。',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
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

  const goToDailyRecordPage = () => {
    router.push({
      pathname: `/customers/${customerId}/records/${formattedDate}/`,
    });
  };
  return (
    <>
      <Layout>
        <form>
          <Heading color='color.sub' as='h2' mb='4' size='xl' noOfLines={1}>
            記録の編集
          </Heading>
          <Box border='1px' borderRadius='md'>
            <Flex mb='2' textAlign='center' borderTopRadius='md' bg='color.mainTransparent1'>
              <Box p='2' w='50%' borderRight='1px'>
                ご本人の様子
              </Box>
              <Box p='2' w='50%'>
                支援・考察
              </Box>
            </Flex>
            <Flex mb='2'>
              <Textarea
                p='1'
                m='1'
                minH='200'
                overflow='hidden'
                resize='none'
                minRows={1}
                as={ResizeTextarea}
                placeholder='ご本人の様子'
                width='50%'
                bg='white'
                id='situation'
                {...register('situation')}
              />
              <Textarea
                p='1'
                m='1'
                minH='200'
                overflow='hidden'
                resize='none'
                minRows={1}
                as={ResizeTextarea}
                placeholder='支援・考察'
                width='50%'
                bg='white'
                id='support'
                {...register('support')}
              />
            </Flex>
            <Stack spacing={5} direction='row' p='2'>
              <Checkbox colorScheme='blue' {...register('good')}>
                Good
              </Checkbox>
              <Checkbox colorScheme='red' {...register('notice')}>
                特記事項
              </Checkbox>
            </Stack>
          </Box>

          <Flex mt='2'>
            <Button colorScheme='teal' size='sm' onClick={() => goToDailyRecordPage()}>
              戻る
            </Button>
            <Spacer />
            <Button
              ml='2'
              size='sm'
              colorScheme='facebook'
              onClick={handleSubmit(onSubmitSingleRecord)}
            >
              保存
            </Button>
          </Flex>
        </form>
      </Layout>
    </>
  );
}
