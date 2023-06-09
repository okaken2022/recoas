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
import { BasicInfoOfRecord, SingleRecord } from '@/types/record';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { CustomerInfoType } from '@/types/customerInfo';
import { fetchCustomer } from '@/utils/fetchCustomer';
import { SubmitHandler, useForm } from 'react-hook-form';
import { NextPage } from 'next';

// export async function getStaticProps() {
//   // 日付を取得
//   const date = new Date();
//   const formattedDateJa = moment(date).format('YYYY年M月D日 (ddd)');

//   return {
//     props: {
//       formattedDateJa,
//     },
//   };
// }

// export async function getStaticPaths() {
//   const customerIds: string[] = [];

//   try {
//     const querySnapshot = await getDocs(collection(db, 'customers'));
//     querySnapshot.forEach((doc) => {
//       customerIds.push(doc.id);
//     });
//   } catch (error) {
//     console.error('Error fetching customerIds:', error);
//   }

//   const paths = customerIds.map((id) => ({
//     params: { id },
//   }));

//   return {
//     paths,
//     fallback: false,
//   };
// }

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
  moment.locale('ja');
  const formattedMonth = moment(date).format('YYYY-MM'); //月の文字列
  const formattedDate = moment(date).format('YYYY-MM-DD'); //日付の文字列
  const formattedDateJa = moment(date).format('YYYY年M月D日 (ddd)');

  {
    /* 利用者情報取得 */
  }
  const { id: customerId } = router.query as { id: string }; // クエリパラメーターからcustomerIdを取得

  useEffect(() => {
    if (customerId) {
      const id = Array.isArray(customerId) ? customerId[0] : customerId;
      fetchCustomer(id, setCustomer);
      fetchBasiRecordInfo();
      fetchSingleRecord();
    }
  }, [customerId, setValue]);

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
  const fetchBasiRecordInfo = async () => {
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

  const returnList = () => {
    router.push({
      pathname: `/customers/${customerId}/`,
    });
  };

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

  return (
    <>
      <Layout>
        <form>
          <Heading color='color.sub' as='h2' mb='4' size='xl' noOfLines={1}>
            {customer?.customerName}さん
          </Heading>
          <Text color='color.main' fontWeight={'bold'}>
            ※各記録をタップすると編集できます
          </Text>
          {/* 基本情報 */}
          <Grid
            h='auto'
            templateRows='repeat(9, 1fr)'
            templateColumns='repeat(2, 1fr)'
            // gap={2}
            border='1px'
            borderTopRadius='md'
          >
            {/* 日付 */}
            <GridItem rowSpan={2} colSpan={2} bg='color.mainTransparent1' p={2}>
              <Flex alignItems='center'>
                <Text fontSize={{ base: 'md', md: 'xl' }}>{formattedDate}</Text>
                <Spacer />

                {/* 記入者 */}
                <Text>記入者：</Text>
                <Input
                  size={{ base: 'sm', md: 'md' }}
                  placeholder='岡田'
                  width='30%'
                  bg='white'
                  type='text'
                  id='author'
                  {...register('author')}
                />
                {errors.author && <FormErrorMessage>{errors.author.message}</FormErrorMessage>}
              </Flex>
            </GridItem>

            {/* 活動 */}
            <GridItem rowSpan={2} colSpan={2} bg='white' p={2}>
              <Flex alignItems='center'>
                <Text>活動</Text>
                <Spacer />
                <Text>午前：</Text>
                <Input
                  size={{ base: 'sm', md: 'md' }}
                  placeholder='コーヒー'
                  width='60%'
                  bg='white'
                  type='text'
                  id='amWork'
                  {...register('amWork')}
                />
              </Flex>
            </GridItem>
            <GridItem rowSpan={2} colSpan={2} bg='white' p={2}>
              <Flex alignItems='center'>
                <Spacer />
                <Text>午後：</Text>
                <Input
                  size={{ base: 'sm', md: 'md' }}
                  placeholder='菓子製造'
                  width='60%'
                  bg='white'
                  type='text'
                  id='pmWork'
                  {...register('pmWork')}
                />
              </Flex>
            </GridItem>

            <GridItem rowSpan={2} colSpan={2} bg='white' p={2} borderBottom='1px'>
              <Flex alignItems='center' gap='2'>
                <Text>工賃</Text>
                <Spacer />
                <RadioGroup onChange={handleRadioChange} value={isCustomTime ? '変更' : '通常'}>
                  <Stack spacing={3} direction='row'>
                    <Radio colorScheme='green' defaultChecked value='通常'>
                      通常
                    </Radio>
                    <Radio colorScheme='red' value='変更'>
                      変更
                    </Radio>
                  </Stack>
                </RadioGroup>
                <Input
                  size={{ base: 'sm', md: 'md' }}
                  placeholder='0'
                  width='20%'
                  bg='white'
                  type='text'
                  id='timeAdjustment'
                  {...register('timeAdjustment', { valueAsNumber: true })}
                  defaultValue={0}
                  readOnly={!isCustomTime} // '変更'が選択されていない場合は読み取り専用にする
                />
                分
                <Button
                  colorScheme='teal'
                  size={{ base: 'xs', md: 'md' }}
                  onClick={handleSubmit(onSubmitBasicInfo)}
                >
                  保存
                </Button>
              </Flex>
            </GridItem>

            {/* 記録 */}
            <GridItem
              rowSpan={1}
              colSpan={1}
              bg='white'
              alignItems='center'
              textAlign='center'
              borderRight='1px'
            >
              ご本人の様子
            </GridItem>
            <GridItem rowSpan={1} colSpan={1} bg='white' alignItems='center' textAlign='center'>
              支援、考察
            </GridItem>
          </Grid>

          <UnorderedList
            listStyleType='none'
            ml='0'
            border='1px'
            borderBottomRadius='md'
            fontSize={{ base: 'sm', md: 'md' }}
          >
            {singleRecordData.map((record, index) => {
              const { docId, data } = record;
              const { situation, support, good, notice } = data;

              const backgroundColor = index % 2 === 0 ? 'gray.100' : 'white'; // 背景色を交互に設定

              return (
                <ListItem
                  key={docId}
                  className='record'
                  backgroundColor={backgroundColor}
                  onClick={() => goToRecordEditPage(docId)}
                >
                  {good && (
                    <Badge ml='2' colorScheme='teal'>
                      Good
                    </Badge>
                  )}
                  {notice && (
                    <Badge ml='2' colorScheme='red'>
                      特記事項
                    </Badge>
                  )}
                  <Flex>
                    <Box p='2' w='50%' borderRight='1px'>
                      {situation}
                    </Box>
                    <Box p='2' w='50%'>
                      {support}
                    </Box>
                  </Flex>
                </ListItem>
              );
            })}
          </UnorderedList>
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
