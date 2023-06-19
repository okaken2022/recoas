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
import { Customer } from '@/types/customer';

export default function Home() {
  {
    /* state */
  }
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [addCustomer, setAddCustomer] = useState<Customer>({
    customerName: '',
    romaji: '',
    service: '生活介護',
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
  }
  const createCustomer = async (customerName: string, romaji: string, service: string) => {
    if (!currentUser) return;
    if (customerName === '') return;
    await addDoc(collection(db, 'customers'), {
      customerName: customerName,
      romaji: romaji,
      service: service,
    });
    console.log(customers);
  };

  const onSubmit = ({
    customerName,
    romaji,
    service,
  }: {
    customerName: string;
    romaji: string;
    service: string;
  }) => {
    createCustomer(customerName, romaji, service);
    setAddCustomer({ customerName: '', romaji: '', service: '生活介護' });
    console.log(addCustomer);
    setCustomers(customers);
  };

  // {
  //   /* Enter押下で送信 */
  //   /* 日本語変換中は送信しない */
  // }
  // const [composing, setComposition] = useState(false);
  // const startComposition = () => setComposition(true);
  // const endComposition = () => setComposition(false);
  // const handleKeyDown = (
  //   e: React.KeyboardEvent<HTMLInputElement>,
  //   { title, status }: { title: string; status: string },
  // ) => {
  //   if (e.key === 'Enter') {
  //     if (composing) return;
  //     onSubmit({ title, status });
  //   }
  // };

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
        <Heading color='color.sub' as='h2' mb='8' size='xl' noOfLines={1}>
          利用者の追加
        </Heading>
        {/* 利用者の追加フォーム */}
        <Box mb={12}>
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
              onChange={(e) => setAddCustomer({ ...addCustomer, service: e.target.value })}
            >
              <option value='生活介護'>生活介護</option>
              <option value='多機能生活介護'>多機能生活介護</option>
              <option value='就労継続支援B型'>就労継続支援B型</option>
            </Select>
            <Spacer />
            <Button
              colorScheme='teal'
              onClick={() => {
                onSubmit(addCustomer);
              }}
            >
              <AddIcon />
            </Button>
          </Flex>
        </Box>

        {/* 利用者一覧 */}
        <Text fontSize='2xl'>利用者一覧</Text>
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
