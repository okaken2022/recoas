import {
  Heading,
  Spacer,
  Box,
  Flex,
  Button,
  Checkbox,
  Stack,
  Textarea,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';

import Layout from '@/components/Layout';

import {  useContext, useEffect, useState } from 'react';
import ResizeTextarea from 'react-textarea-autosize';

import moment from 'moment';
import {  SingleRecord } from '@/types/record';
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { CustomerInfoType } from '@/types/customerInfo';
import { fetchCustomer } from '@/utils/fetchCustomer';
import { SubmitHandler, useForm } from 'react-hook-form';

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
    /* toast, modal */
  }
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  {
    /* state */
  }
  const [customer, setCustomer] = useState<CustomerInfoType | null>(null);
  const [isGood, setIsGood] = useState(false);
  const [hasNotice, setHasNotice] = useState(false);
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
      setValue('editor', data.editor);
      setValue('serialNumber', data.serialNumber);
      setIsGood(data.good);
      setHasNotice(data.notice);

      setSingleRecordData({ docId, data: data as SingleRecord });
    } else {
      setSingleRecordData(null);
    }
  };

  {
    /* good, noticeのトグル */
  }
  const handleGoodToggle = () => {
    setIsGood((prevValue) => !prevValue);
  };
  const handleNoticeToggle = () => {
    setHasNotice((prevValue) => !prevValue);
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

        router.push({
          pathname: `/customers/${customerId}/records/${formattedDate}/`,
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

  {
    /* singleRecord削除 */
  }
  const openDeleteModal = async () => {
    // モーダルを開く
    onOpen();
  };

  const handleDelete = async (docId: string) => {
    try {
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
      await deleteDoc(singleRecordRef);

      console.log('削除が完了しました');
      router.push({
        pathname: `/customers/${customerId}/records/${formattedDate}/`,
      });
      toast({
        title: '記録を削除しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('削除に失敗しました', error);
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
              <Checkbox
                colorScheme='blue'
                {...register('good')}
                isChecked={isGood}
                onChange={handleGoodToggle}
              >
                Good
              </Checkbox>
              <Checkbox
                colorScheme='red'
                {...register('notice')}
                isChecked={hasNotice}
                onChange={handleNoticeToggle}
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

            <Button size='sm' colorScheme='red' onClick={openDeleteModal}>
              削除
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>削除の確認</ModalHeader>
                <ModalCloseButton />
                <ModalBody>本当に削除しますか？</ModalBody>
                <ModalFooter>
                  <Button colorScheme='red' onClick={() => handleDelete(docId as string)}>
                    削除
                  </Button>
                  <Button variant='ghost' onClick={onClose}>
                    キャンセル
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

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
