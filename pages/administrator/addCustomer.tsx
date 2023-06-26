import {
  Input,
  Button,
  UnorderedList,
  ListItem,
  Box,
  Divider,
  Flex,
  Heading,
  Spacer,
  ButtonGroup,
  Select,
  Wrap,
  WrapItem,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';
import { Header } from '@/components/Header';
import {
  onSnapshot,
  collection,
  doc,
  setDoc,
  orderBy,
  query,
  DocumentData,
  updateDoc,
  addDoc,
} from 'firebase/firestore';

import { v4 as uuidv4 } from 'uuid';
import { useState, useContext, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { Todo, firestoreTodo } from '@/types/todo';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import Layout from '@/components/Layout';
import { Customer, ServiceType } from '@/types/customer';

export default function Home() {
  {
    /* state */
  }
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [addCustomer, setAddCustomer] = useState<Customer>({
    customerName: '',
    romaji: '',
    service: '生活介護',
    targetOfSupport1: '',
    targetOfSupport2: '',
    targetOfSupport3: '',
    detailOfSupport1: '',
    detailOfSupport2: '',
    detailOfSupport3: '',
  });

  {
    /* ログイン */
  }
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);
  const router: NextRouter = useRouter();

  {
    /* 利用者追加 */
    // try, catch
  }
  const createCustomer = async (customerName: string, romaji: string, service: string,targetOfSupport1: string,
    targetOfSupport2: string,
    targetOfSupport3: string,
    detailOfSupport1: string,
    detailOfSupport2: string,
    detailOfSupport3: string,) => {
    if (!currentUser) return;
    if (customerName === '') return;
    await addDoc(collection(db, 'customers'), {
      customerName: customerName,
      romaji: romaji,
      service: service,
      targetOfSupport1: targetOfSupport1,
      targetOfSupport2: targetOfSupport2,
      targetOfSupport3: targetOfSupport3,
      detailOfSupport1: detailOfSupport1,
      detailOfSupport2: detailOfSupport2,
      detailOfSupport3: detailOfSupport3,
    });
    console.log(customers);
  };

  const onSubmit = ({
    customerName,
    romaji,
    service,
    targetOfSupport1,
    targetOfSupport2,
    targetOfSupport3,
    detailOfSupport1,
    detailOfSupport2,
    detailOfSupport3,
  }: {
    customerName: string;
    romaji: string;
    service: string;
    targetOfSupport1: string,
    targetOfSupport2: string,
    targetOfSupport3: string,
    detailOfSupport1: string,
    detailOfSupport2: string,
    detailOfSupport3: string,
  }) => {
    createCustomer(customerName, romaji, service, targetOfSupport1,
      targetOfSupport2,
      targetOfSupport3,
      detailOfSupport1,
      detailOfSupport2,
      detailOfSupport3,);
    setAddCustomer({ customerName: '', romaji: '', service: '生活介護', targetOfSupport1: '',
    targetOfSupport2: '',
    targetOfSupport3: '',
    detailOfSupport1: '',
    detailOfSupport2: '',
    detailOfSupport3: '',});
    console.log(addCustomer);
    setCustomers(customers);
  };

  {
    /* 利用者一覧を取得する */
    /* orderByで並べ替え */
  }
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'customers'), orderBy('romaji', 'asc'));
    const unSub = onSnapshot(q, async (snapshot) => {
      setCustomers(
        snapshot.docs.map((doc) => ({
          uid: doc.id,
          customerName: doc.data().customerName,
          romaji: doc.data().romaji,
          service: doc.data().service,
          targetOfSupport1: doc.data().targetOfSupport1,
          targetOfSupport2: doc.data().targetOfSupport2,
          targetOfSupport3: doc.data().targetOfSupport3,
          detailOfSupport1: doc.data().detailOfSupport1,
          detailOfSupport2: doc.data().detailOfSupport2,
          detailOfSupport3: doc.data().detailOfSupport3,
        })),
      );
    });
    return () => {
      unSub();
    };
  }, [currentUser]);

  return (
    <>
      <Layout>
      <Text className='head' fontSize='2xl'>利用者の追加</Text>
        {/* 利用者の追加フォーム */}
        <Text className='lead' fontSize='xl' m='4'>利用者情報</Text>
        <Box mb={12}>
          <Box  className='text_card' p="2">
            <Flex alignItems='center' m='4'>
              <Text w='20%'>利用者:</Text>
              <Spacer />
              <Input
                ml={2}
                w='80%'
                value={addCustomer.customerName}
                onChange={(e) => setAddCustomer({ ...addCustomer, customerName: e.target.value })}
                type='text'
                id='customer'
                placeholder='田中 太郎'
              />
            </Flex>
            <Flex alignItems='center' m='4'>
              <Text w='20%'>ローマ字:</Text>
              <Spacer />
              <Input
                ml={2}
                w='80%'
                value={addCustomer.romaji}
                onChange={(e) => setAddCustomer({ ...addCustomer, romaji: e.target.value })}
                type='text'
                id='customer'
                placeholder='Tanaka Taro'
              />
            </Flex>

            <Flex alignItems='center' m='4'>
              <Text w='20%'>サービス:</Text>
              <Select
                ml={2}
                width='200px'
                onChange={(e) => setAddCustomer({ ...addCustomer, service: e.target.value as ServiceType })}
              >
                <option value='生活介護'>生活介護</option>
                <option value='多機能生活介護'>多機能生活介護</option>
                <option value='就労継続支援B型'>就労継続支援B型</option>
              </Select>
              <Spacer />
            </Flex>
          </Box>

          <Text className='lead' fontSize='xl' m='4'>支援目標</Text>
          <Box mb='8'>
            <Flex alignItems='center' m='4'>
              <Text w='20%'>支援目標 1:</Text>
              <Spacer />
              <Input
                ml={2}
                w='80%'
                value={addCustomer.targetOfSupport1}
                onChange={(e) => setAddCustomer({ ...addCustomer, targetOfSupport1: e.target.value })}
                type='text'
                id='targetOfSupport1'
              />
            </Flex>
            <Flex alignItems='center' m='4' ml='8'>
              <Text w='20%'>支援内容 1:</Text>
              <Spacer />
              <Textarea
                ml={2}
                w='80%'
                value={addCustomer.detailOfSupport1}
                onChange={(e) => setAddCustomer({ ...addCustomer, detailOfSupport1: e.target.value })}
                id='detailOfSupport1'
              />
            </Flex>
          </Box>
          <Divider />
          <Box mb='8'>
            <Flex alignItems='center' m='4'>
              <Text w='20%'>支援目標 2:</Text>
              <Spacer />
              <Input
                ml={2}
                w='80%'
                value={addCustomer.targetOfSupport2}
                onChange={(e) => setAddCustomer({ ...addCustomer, targetOfSupport2: e.target.value })}
                type='text'
                id='targetOfSupport2'
              />
            </Flex>
            <Flex alignItems='center' m='4' ml='8'>
              <Text w='20%'>支援内容 2:</Text>
              <Spacer />
              <Textarea
                ml={2}
                w='80%'
                value={addCustomer.detailOfSupport2}
                onChange={(e) => setAddCustomer({ ...addCustomer, detailOfSupport2: e.target.value })}
                id='detailOfSupport2'
              />
            </Flex>
          </Box>
          <Divider />
          <Box mb='8'>
            <Flex alignItems='center' m='4'>
              <Text w='20%'>支援目標 3:</Text>
              <Spacer />
              <Input
                ml={2}
                w='80%'
                value={addCustomer.targetOfSupport3}
                onChange={(e) => setAddCustomer({ ...addCustomer, targetOfSupport3: e.target.value })}
                type='text'
                id='targetOfSupport3'
              />
            </Flex>
            <Flex alignItems='center' m='4' ml='8'>
              <Text w='20%'>支援内容 3:</Text>
              <Spacer />
              <Textarea
                ml={2}
                w='80%'
                value={addCustomer.detailOfSupport3}
                onChange={(e) => setAddCustomer({ ...addCustomer, detailOfSupport3: e.target.value })}
                id='detailOfSupport3'
              />
            </Flex>
          </Box>
          <Flex>
            <Spacer />
          <Button
              colorScheme='teal'
              onClick={() => {
                onSubmit(addCustomer);
              }}
            >
              <AddIcon mr="2"/>利用者を追加する
            </Button>
          </Flex>
        </Box>

        {/* 利用者一覧 */}
        <Text className='head'  fontSize='2xl'>利用者情報の編集</Text>
        <UnorderedList listStyleType='none'>
          {customers.map((customer) => (
            <ListItem key={customer.uid} p={4} ml={0}>
              <Heading size='md'>{customer.customerName}</Heading>
              <Divider orientation='horizontal' mt='4' />
            </ListItem>
          ))}
        </UnorderedList>
      </Layout>
    </>
  );
}
