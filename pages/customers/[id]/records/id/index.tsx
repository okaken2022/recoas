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
  UnorderedList,
  ListItem,
  Button,
  ButtonGroup,
  Badge,
  Checkbox,
  Radio,
  RadioGroup,
  Stack,
  FormErrorMessage,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';

import Layout from '@/components/Layout';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useContext, useEffect, useState } from 'react';
import ResizeTextarea from 'react-textarea-autosize';

import moment from 'moment';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { BasicInfoOfRecord } from '@/types/record';
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
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
  } = useForm<BasicInfoOfRecord>();

  {
    /* modal, toast */
  }
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      fetchRecordData();
    }
  }, [customerId, setValue]);
  console.log(customerId);

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
  const fetchRecordData = async () => {
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

  const returnRecords = () => {
    router.push({
      pathname: `/customers/${customerId}/`,
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
                // {...register('situation')}
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
                // {...register('support')}
              />
            </Flex>
            <Stack spacing={5} direction='row' p='2'>
              <Checkbox colorScheme='blue'>Good</Checkbox>
              <Checkbox colorScheme='red'>特記事項</Checkbox>
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
            <Button ml='2' size='sm' colorScheme='facebook'>
              保存
            </Button>
          </Flex>
        </form>
      </Layout>
    </>
  );
}
