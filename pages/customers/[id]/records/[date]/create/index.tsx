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
import { addDoc, collection, getDocs } from 'firebase/firestore';
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
  const [singleRecordData, setSingleRecordData] = useState<SingleRecord | null>(
    null,
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
      // fetchRecordData();
    }
  }, [customerId, setValue]);
  console.log(customerId);

  {
    /* singleRecord保存 */
  }
  const createsingleRecord = async (
    editor: string | null,
    situation: string,
    support: string,
    good: boolean,
    notice: boolean,
  ) => {
    if (!currentUser) return;
    //formが空の場合送信しない処理を追加

    const singleRecordCollectionRef = collection(
      db,
      'customers',
      customerId as string,
      'monthlyRecords',
      formattedMonth,
      'dailyRecords',
      formattedDate,
      'singleRecord',
    );

    // singleRecordコレクション内のドキュメント数を取得
    const querySnapshot = await getDocs(singleRecordCollectionRef);
    const documentCount = querySnapshot.size;

    // 連番を付与するために、取得したドキュメント数に1を加える
    const serialNumber = documentCount + 1;

    const data = {
    serialNumber: serialNumber,
    editor: user?.name,
    situation: situation,
    support: support,
    good: good,
    notice: notice,
    };

    await addDoc(singleRecordCollectionRef, data)

    console.log('データが登録されました');
  };

  const onSubmitSingleRecord: SubmitHandler<SingleRecord> = async (data) => {
    console.log('発火')
    try {
      await createsingleRecord( data.editor, data.situation, data.support, data.good, data.notice);
      toast({
        title: '記録を保存しました。',
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

  return (
    <>
      <Layout>
        <form>
          <Heading color='color.sub' as='h2' mb='4' size='xl' noOfLines={1}>
            記録の追加
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
              <Checkbox colorScheme='blue' {...register('good')}>Good</Checkbox>
              <Checkbox colorScheme='red' {...register('notice')}>特記事項</Checkbox>
            </Stack>
          </Box>

          <Flex mt='2'>
            <Button colorScheme='teal' size='sm'>
              戻る
            </Button>
            <Spacer />
            <Button size='sm' colorScheme='red'>
              削除
            </Button>
            <Button ml='2' size='sm' colorScheme='facebook' onClick={handleSubmit(onSubmitSingleRecord)}>
              保存
            </Button>
          </Flex>
        </form>
      </Layout>
    </>
  );
}
