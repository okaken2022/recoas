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

import { ChangeEvent, useContext, useEffect, useState } from 'react';
import ResizeTextarea from 'react-textarea-autosize';

import moment from 'moment';
import { BasicInfoOfRecord, SingleRecord } from '@/types/record';
import { DocumentData, addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
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
  const [singleRecordData, setSingleRecordData] = useState<{
    docId: string;
    data: SingleRecord;
  } | null>(null);

  {
    /* ログイン */
  }
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);

  const router: NextRouter = useRouter();
  const { docId } = router.query;
  console.log(docId);

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
    }
    if (docId) {
      updateSingleRecordData(docId as string);
    }
  }, [customerId, docId, setValue]);
  console.log(customerId);

  {
    /* singleRecord取得 */
  }
  const updateSingleRecordData = async (docId: string) => {
    const singleRecordRef = doc(
      db,
      'customers',
      customerId,
      'monthlyRecords',
      formattedMonth,
      'dailyRecords',
      formattedDate,
      'singleRecord',
      docId,
    );
    const docSnapshot = await getDoc(singleRecordRef);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();

      setValue('situation', data.situation);
      setValue('support', data.support);
      setValue('good', data.good);
      setValue('notice', data.notice);
      setValue('editor', data.editor);
      setValue('serialNumber', data.serialNumber);

      setSingleRecordData({ docId, data: data as SingleRecord });
    } else {
      setSingleRecordData(null);
    }
  };

  {
    /* singleRecord編集、保存 */
  }

  const onSubmitSingleRecord: SubmitHandler<SingleRecord> = async (data) => {
    console.log(singleRecordData);
    try {
      if (singleRecordData) {
        const { docId } = singleRecordData;
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

  // チェックボックスの状態をトグルするハンドラー関数
  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setValue('good', checked);
    setValue('notice', checked);
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
              <Checkbox
                colorScheme='blue'
                {...register('good')}
                defaultChecked={singleRecordData?.data.good || false}
                onChange={(e) => setValue('good', e.target.checked)}
              >
                Good
              </Checkbox>
              <Checkbox
                colorScheme='red'
                {...register('notice')}
                defaultChecked={singleRecordData?.data.notice || false}
                onChange={(e) => setValue('notice', e.target.checked)}
              >
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
