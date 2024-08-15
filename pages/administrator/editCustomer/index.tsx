import {
  Button,
  UnorderedList,
  ListItem,
  Divider,
  Flex,
  Heading,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { useAuth, db } from '@/hooks/firebase';
import { type NextRouter, useRouter } from 'next/router';
import { onSnapshot, collection, orderBy, query, deleteDoc, doc } from 'firebase/firestore';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import type { AddCustomer } from '@/types/customer';

export default function Home() {
  const [customers, setCustomers] = useState<AddCustomer[]>([]);
  ({
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

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const auth = useAuth();
  const currentUser = auth.currentUser;
  const router: NextRouter = useRouter();

  const toast = useToast();

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
        {/* 利用者一覧 */}
        <Text className='head' fontSize='2xl'>
          利用者の編集、削除
        </Text>
        <UnorderedList listStyleType='none'>
          {customers.map((customer) => (
            <ListItem key={customer.uid} p={4} ml={0}>
              <Flex justify='space-between' align='center'>
                <Heading size='md'>{customer.customerName}</Heading>
                <Flex gap='16px'>
                  <Button
                    colorScheme='blue'
                    onClick={() => router.push(`/administrator/editCustomer/${customer.uid}`)}
                  >
                    編集
                  </Button>
                  <Button
                    colorScheme='red'
                    onClick={() => {
                      setSelectedCustomerId(customer.uid ?? null); // `undefined` の場合は `null` を設定
                      // ここで名前を取得して状態に設定する
                      setSelectedCustomerName(customer.customerName);
                      onOpen();
                    }}
                  >
                    削除
                  </Button>
                </Flex>
              </Flex>
              <Divider orientation='horizontal' mt='4' />
            </ListItem>
          ))}
        </UnorderedList>
      </Layout>

      {/* 削除確認モーダル */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>削除確認</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedCustomerName ? (
              <Text>
                <Text as='span' fontWeight='bold' size='xl'>
                  {selectedCustomerName}
                </Text>
                <Text as='span'> を削除してもよろしいですか？</Text>
              </Text>
            ) : (
              <Text>利用者を削除してもよろしいですか？</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              キャンセル
            </Button>
            <Button
              colorScheme='red'
              onClick={async () => {
                if (selectedCustomerId) {
                  await deleteDoc(doc(db, 'customers', selectedCustomerId));
                  toast({
                    title: '利用者を削除しました。',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  });
                }
              }}
            >
              削除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
