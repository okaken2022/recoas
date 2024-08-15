import {
  Input,
  Button,
  Box,
  Divider,
  Flex,
  Text,
  Textarea,
  useToast,
  Select,
  Spacer,
  Heading,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { type NextRouter, useRouter } from 'next/router';
import { useState, useContext, useEffect } from 'react';
import { onSnapshot, doc, updateDoc } from 'firebase/firestore';
import Layout from '@/components/Layout';
import type { AddCustomer, ServiceType } from '@/types/customer';

export default function EditCustomer() {
  /* state */
  const [customer, setCustomer] = useState<AddCustomer | null>(null);
  const [editCustomer, setEditCustomer] = useState<AddCustomer | null>(null);

  /* ログイン */
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);
  const router: NextRouter = useRouter();
  const { uid } = router.query; // クエリパラメーターからcustomerIdを取得
  console.log('Customer UID:', uid);
  console.log(user);

  const toast = useToast();

  /* 利用者情報を取得する */
  useEffect(() => {
    if (!currentUser || !uid) return;

    const docRef = doc(db, 'customers', uid as string);
    const unSub = onSnapshot(docRef, (doc) => {
      const data = doc.data();
      if (data) {
        setCustomer({
          uid: doc.id,
          customerName: data.customerName,
          romaji: data.romaji,
          service: data.service,
          targetOfSupport1: data.targetOfSupport1,
          targetOfSupport2: data.targetOfSupport2,
          targetOfSupport3: data.targetOfSupport3,
          detailOfSupport1: data.detailOfSupport1,
          detailOfSupport2: data.detailOfSupport2,
          detailOfSupport3: data.detailOfSupport3,
        });
        setEditCustomer({
          uid: doc.id,
          customerName: data.customerName,
          romaji: data.romaji,
          service: data.service,
          targetOfSupport1: data.targetOfSupport1,
          targetOfSupport2: data.targetOfSupport2,
          targetOfSupport3: data.targetOfSupport3,
          detailOfSupport1: data.detailOfSupport1,
          detailOfSupport2: data.detailOfSupport2,
          detailOfSupport3: data.detailOfSupport3,
        });
      }
    });

    return () => {
      unSub();
    };
  }, [currentUser, uid]);

  /* 利用者情報の更新 */
  const updateCustomer = async (customerData: AddCustomer) => {
    if (!currentUser || !uid) return;

    try {
      const docRef = doc(db, 'customers', uid as string);
      await updateDoc(docRef, customerData);
      toast({
        title: '利用者情報を更新しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/'); // Navigate back to the home or a different page
    } catch (e) {
      console.error(e);
      toast({
        title: '更新に失敗しました。',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const onSubmit = () => {
    if (editCustomer) {
      updateCustomer(editCustomer);
    }
  };

  if (!editCustomer) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <Layout>
        <Text className='head' fontSize='2xl'>
          利用者の編集
        </Text>
        {/* 利用者の編集フォーム */}
        <Text className='lead' fontSize='xl' m='4'>
          利用者情報
        </Text>
        <Box mb={12}>
          <Box className='text_card' p='2'>
            <Flex alignItems='center' m='4'>
              <Text w='20%'>利用者:</Text>
              <Spacer />
              <Input
                ml={2}
                w='80%'
                value={editCustomer.customerName}
                onChange={(e) => setEditCustomer({ ...editCustomer, customerName: e.target.value })}
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
                value={editCustomer.romaji}
                onChange={(e) => setEditCustomer({ ...editCustomer, romaji: e.target.value })}
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
                value={editCustomer.service}
                onChange={(e) =>
                  setEditCustomer({ ...editCustomer, service: e.target.value as ServiceType })
                }
              >
                <option value='生活介護'>生活介護</option>
                <option value='多機能生活介護'>多機能生活介護</option>
                <option value='就労継続支援B型'>就労継続支援B型</option>
              </Select>
              <Spacer />
            </Flex>
          </Box>

          <Text className='lead' fontSize='xl' m='4'>
            支援目標
          </Text>
          <Box mb='8'>
            <Flex alignItems='center' m='4'>
              <Text w='20%'>支援目標 1:</Text>
              <Spacer />
              <Input
                ml={2}
                w='80%'
                value={editCustomer.targetOfSupport1}
                onChange={(e) =>
                  setEditCustomer({ ...editCustomer, targetOfSupport1: e.target.value })
                }
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
                value={editCustomer.detailOfSupport1}
                onChange={(e) =>
                  setEditCustomer({ ...editCustomer, detailOfSupport1: e.target.value })
                }
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
                value={editCustomer.targetOfSupport2}
                onChange={(e) =>
                  setEditCustomer({ ...editCustomer, targetOfSupport2: e.target.value })
                }
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
                value={editCustomer.detailOfSupport2}
                onChange={(e) =>
                  setEditCustomer({ ...editCustomer, detailOfSupport2: e.target.value })
                }
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
                value={editCustomer.targetOfSupport3}
                onChange={(e) =>
                  setEditCustomer({ ...editCustomer, targetOfSupport3: e.target.value })
                }
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
                value={editCustomer.detailOfSupport3}
                onChange={(e) =>
                  setEditCustomer({ ...editCustomer, detailOfSupport3: e.target.value })
                }
                id='detailOfSupport3'
              />
            </Flex>
          </Box>
          <Flex m='4'>
            <Button onClick={onSubmit}>更新</Button>
          </Flex>
        </Box>
      </Layout>
    </>
  );
}
