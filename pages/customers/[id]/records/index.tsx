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
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';

import Layout from '@/components/Layout';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useContext, useEffect, useState } from 'react';

import moment from 'moment';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { BasicInfoOfRecord } from '@/types/record';
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { CustomerInfoType } from '@/types/customerInfo';
import { fetchCustomer } from '@/utils/fetchCustomer';

export default function RecordPage() {
  {
    /* state */
  }
  const [addBasicInfo, setAddBasicInfo] = useState<BasicInfoOfRecord>({
    editor: '',
    amWork: '',
    pmWork: '',
    timeAdjustment: 0,
  });

  const [customer, setCustomer] = useState<CustomerInfoType | null>(null);

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
  const { id: customerId } = router.query as { id: string };; // クエリパラメーターからcustomerIdを取得

  useEffect(() => {
    if (customerId) {
      const id = Array.isArray(customerId) ? customerId[0] : customerId;
      fetchCustomer(id, setCustomer);
    }
  }, [customerId]);
  console.log(customerId)

  {
    /* 記録母体保存 */
  }
  const createBasicInfo = async (
    editor: string,
    amWork: string,
    pmWork: string,
    timeAdjustment: number,
  ) => {
    if (!currentUser) return;

    const recordsCollectionRef = collection(db, 'customers', customerId as string, 'records', formattedMonth, 'record');
    const daylyDocumentRef = doc(recordsCollectionRef, formattedDate);
    const monthSnapshot = await getDoc(daylyDocumentRef);
      if (!monthSnapshot.exists()) {
        const data = {
          editor: editor,
          amWork: amWork,
          pmWork: pmWork,
          timeAdjustment: timeAdjustment
        };

  await setDoc(daylyDocumentRef, data);
}
  };

  const onSubmit = ({
    editor,
    amWork,
    pmWork,
    timeAdjustment
  }: {
    editor: string;
    amWork: string;
    pmWork: string;
    timeAdjustment: number;
  }) => {
    createBasicInfo(editor, amWork, pmWork, timeAdjustment);
    setAddBasicInfo({editor: '', amWork: '', pmWork: '', timeAdjustment: 0});
    console.log(addBasicInfo);
    setAddBasicInfo(addBasicInfo);
  };

  const editRecord = () => {
    alert('click')
  }

  return (
    <>
      <Layout>
        <Heading color='color.sub' as='h2' mb='8' size='xl' noOfLines={1}>
          {customer?.customerName}さん
        </Heading>
        {/* テキストはクリックで編集可能 */}

        {/* 記録全体 */}
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
              <Text fontSize={{ base: 'md', md: 'xl' }}>{formattedDateJa}</Text>
              <Spacer />

              {/* 記入者 */}
              <Text>記入者：</Text>
              <Input
              size={{ base: 'sm', md: 'md' }}
                placeholder='岡田'
                width='30%'
                bg='white'
                type='text'
                id='editor'
                value={addBasicInfo.editor}
                onChange={(e) => setAddBasicInfo({ ...addBasicInfo, editor: e.target.value })}
              />
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
                value={addBasicInfo.amWork}
                onChange={(e) => setAddBasicInfo({ ...addBasicInfo, amWork: e.target.value })}
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
                value={addBasicInfo.pmWork}
                onChange={(e) => setAddBasicInfo({ ...addBasicInfo, pmWork: e.target.value })}
              />
            </Flex>
          </GridItem>

          <GridItem rowSpan={2} colSpan={2} bg='white' p={2} borderBottom='1px'>
            <Flex alignItems='center' gap='2'>
            <Text>工賃</Text>
              <Spacer />
              <RadioGroup>
                <Stack spacing={5} direction='row'>
                  <Radio colorScheme='green' defaultChecked>
                    通常
                  </Radio>
                  <Radio colorScheme='red'>
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
                id='pmWork'
                value={addBasicInfo.pmWork}
                onChange={(e) => setAddBasicInfo({ ...addBasicInfo, pmWork: e.target.value })}
              />分
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

        <UnorderedList listStyleType='none' ml='0' border='1px' borderBottomRadius='md' fontSize={{ base: 'sm', md: 'md' }} >
          {/* {todos.map((todo) => ( */}
          <ListItem key=''  className='record' onClick={editRecord}>
            <Flex>
              <Box p='2' w='50%' borderRight='1px'>
                テキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入ります
              </Box>
              <Box p='2' w='50%'>
                テキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入ります
              </Box>
            </Flex>
          </ListItem>
          <ListItem key='' backgroundColor='teal.50' className='record' onClick={editRecord}>
            <Badge ml='2' colorScheme='teal'>Good</Badge>
            <Flex>
              <Box p='2' w='50%' borderRight='1px'>
                テキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入ります
              </Box>
              <Box p='2' w='50%'>
                テキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入ります
              </Box>
            </Flex>
          </ListItem>
          <ListItem key='' className='record' onClick={editRecord}>
            <Flex>
              <Box p='2' w='50%' borderRight='1px'>
                テキストが入りますテキストが入りますテキストが入りますテキストが入ります
              </Box>
              <Box p='2' w='50%'></Box>
            </Flex>
          </ListItem>
          <ListItem key='' backgroundColor='red.50' className='record' onClick={editRecord}>
            <Badge ml='2' colorScheme='red'>特記事項</Badge>
            <Flex>
              <Box p='2' w='50%' borderRight='1px'>
                テキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入ります
              </Box>
              <Box p='2' w='50%'>
                テキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入りますテキストが入ります
              </Box>
            </Flex>
          </ListItem>
          {/* ))} */}
        </UnorderedList>
        <Flex mt='2'>
        <Button
              colorScheme='teal'
              size='sm'
              onClick={() => {
                onSubmit(addBasicInfo);
              }}
            >
              保存して戻る
            </Button>
          <Spacer />
            <Button size='sm' colorScheme='facebook'>
              <AddIcon mr='1' />
              記録を追加
            </Button>
        </Flex>
      </Layout>
    </>
  );
}
