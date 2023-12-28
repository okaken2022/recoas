import {
  Input,
  Button,
  Box,
  Divider,
  Flex,
  Spacer,
  Select,
  Text,
  Textarea,
  useToast,
  Stack,
  Checkbox,
} from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';
import { onSnapshot, collection, orderBy, query, addDoc } from 'firebase/firestore';

import { useState, useContext, useEffect } from 'react';
import { AddIcon } from '@chakra-ui/icons';
import Layout from '@/components/Layout';
import { Customer, CustomersByService, ServiceType } from '@/types/customer';
import CustomerList from '@/components/CustomerList';
import { SubmitHandler, useForm } from 'react-hook-form';

export default function Home() {
  {
    /* useForm */
  }
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<Customer>({
    defaultValues: {
      customerName: '',
      hurigana: '',
      service: '生活介護',
      recordFormat: '',
      dateOfUse: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
      targetOfSupport: {
        targetOfSupport1: '',
        targetOfSupport2: '',
        targetOfSupport3: '',
      },
      detailOfSupport: {
        detailOfSupport1: '',
        detailOfSupport2: '',
        detailOfSupport3: '',
      },
    },
  });

  {
    /* ログイン */
  }
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);
  const router: NextRouter = useRouter();
  const toast = useToast();

  {
    /* サービス別利用者一覧 */
  }
  const [allCustomersByService, setAllCustomersByService] = useState<CustomersByService>({
    生活介護: [],
    多機能生活介護: [],
    就労継続支援B型: [],
  });

  useEffect(() => {
    if (!currentUser) router.push('/login');
    const q = query(collection(db, 'customers'), orderBy('romaji', 'asc'));
    const unSub = onSnapshot(q, async (snapshot) => {
      const customersByService: CustomersByService = {
        生活介護: [],
        多機能生活介護: [],
        就労継続支援B型: [],
      };

      snapshot.docs.forEach((doc) => {
        const customer = {
          uid: doc.id,
          customerName: doc.data().customerName,
          hurigana: doc.data().hurigana,
          service: doc.data().service,
          recordFormat: doc.data().recordFormat,
          dateOfUse: {
            monday: doc.data().Monday,
            tuesday: doc.data().Tuesday,
            wednesday: doc.data().Wednesday,
            thursday: doc.data().thursday,
            friday: doc.data().friday,
          },
          targetOfSupport: {
            targetOfSupport1: doc.data().targetOfSupport1,
            targetOfSupport2: doc.data().targetOfSupport2,
            targetOfSupport3: doc.data().targetOfSupport3,
          },
          detailOfSupport: {
            detailOfSupport1: doc.data().detailOfSupport1,
            detailOfSupport2: doc.data().detailOfSupport2,
            detailOfSupport3: doc.data().detailOfSupport3,
          },
        };

        customersByService[customer.service as keyof typeof customersByService].push(customer);
      });

      setAllCustomersByService(customersByService);
    });

    return () => {
      unSub();
    };
  }, [currentUser]);

  {
    /* 利用者追加 */
  }
  const createCustomer = async (
    customerName: string,
    hurigana: string,
    service: string,
    recordFormat: string,
    monday: boolean,
    tuesday: boolean,
    wednesday: boolean,
    thursday: boolean,
    friday: boolean,
    targetOfSupport1: string,
    targetOfSupport2: string,
    targetOfSupport3: string,
    detailOfSupport1: string,
    detailOfSupport2: string,
    detailOfSupport3: string,
  ) => {
    if (!currentUser) return;
    if (customerName === '') return;
    try {
      await addDoc(collection(db, 'customers'), {
        customerName: customerName,
        hurigana: hurigana,
        service: service,
        recordFormat: recordFormat,
        dateOfUse: {
          monday: monday,
          tuesday: tuesday,
          wednesday: wednesday,
          thursday: thursday,
          friday: friday,
        },
        targetOfSupport: {
          targetOfSupport1: targetOfSupport1,
          targetOfSupport2: targetOfSupport2,
          targetOfSupport3: targetOfSupport3,
        },
        detailOfSupport: {
          detailOfSupport1: detailOfSupport1,
          detailOfSupport2: detailOfSupport2,
          detailOfSupport3: detailOfSupport3,
        },
      });
      toast({
        title: '利用者を追加しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: '追加に失敗しました。',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const onSubmitCustomer: SubmitHandler<Customer> = async (data) => {
    try {
      await createCustomer(
        data.customerName,
        data.hurigana,
        data.service,
        data.recordFormat,
        data.dateOfUse.monday,
        data.dateOfUse.tuesday,
        data.dateOfUse.wednesday,
        data.dateOfUse.thursday,
        data.dateOfUse.friday,
        data.targetOfSupport.targetOfSupport1,
        data.targetOfSupport.targetOfSupport2,
        data.targetOfSupport.targetOfSupport3,
        data.detailOfSupport.detailOfSupport1,
        data.detailOfSupport.detailOfSupport2,
        data.detailOfSupport.detailOfSupport3,
      );
      toast({
        title: '基本情報を保存しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      console.log(data);
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
    /* 利用者編集ルーティング */
  }
  const handleCustomerClick = (customerId: string | undefined) => {
    router.push(`/administrator/addCustomer/edit/${customerId}`);
  };

  return (
    <>
      <Layout>
        <Text className='head' fontSize='2xl'>
          利用者の追加
        </Text>
        {/* 利用者の追加 */}
        <Box mb={12} mt={12}>
          {/* 利用者情報フォーム */}
          <Box mb={8} backgroundColor='#FFFBDA' className='text_card' p='2'>
            <Text className='lead' fontSize='xl' m='4'>
              利用者情報
            </Text>
            <Flex alignItems='center' m='4'>
              <Text w='20%'>利用者:</Text>
              <Spacer />
              <Input
                ml={2}
                w='80%'
                backgroundColor='#fff'
                {...register('customerName')}
                onChange={(e) => setValue('customerName', e.target.value)}
                type='text'
                id='customer'
                placeholder='田中 太郎'
              />
            </Flex>
            <Flex alignItems='center' m='4'>
              <Text w='20%'>ふりがな</Text>
              <Spacer />
              <Input
                ml={2}
                w='80%'
                backgroundColor='#fff'
                {...register('hurigana')}
                onChange={(e) => setValue('hurigana', e.target.value)}
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
                backgroundColor='#fff'
                {...register('service')}
                onChange={(e) => setValue('service', e.target.value as ServiceType)}
              >
                <option value='生活介護'>生活介護</option>
                <option value='多機能生活介護'>多機能生活介護</option>
                <option value='就労継続支援B型'>就労継続支援B型</option>
              </Select>
              <Spacer />
            </Flex>
            <Flex alignItems='center' m='4'>
              <Text w='20%'>記録様式:</Text>
              <Select
                ml={2}
                width='200px'
                backgroundColor='#fff'
                {...register('recordFormat')}
                onChange={(e) => setValue('recordFormat', e.target.value as ServiceType)}
              >
                <option value='汎用'>汎用</option>
                <option value='就労継続支援B型'>就労継続支援B型</option>
                <option value='未来工房'>未来工房</option>
                <option value='ドルチェ'>ドルチェ</option>
              </Select>
              <Spacer />
            </Flex>
            <Flex alignItems='center' m='4'>
              <Text w='20%'>利用日:</Text>
              <Stack spacing={5} direction='row'>
                <Checkbox
                  defaultChecked
                  mr={2}
                  {...register('dateOfUse.monday')}
                  onChange={(e) => setValue('dateOfUse.monday', e.target.checked)}
                >
                  月
                </Checkbox>
                <Checkbox
                  defaultChecked
                  mr={2}
                  {...register('dateOfUse.tuesday')}
                  onChange={(e) => setValue('dateOfUse.tuesday', e.target.checked)}
                >
                  火
                </Checkbox>
                <Checkbox
                  defaultChecked
                  mr={2}
                  {...register('dateOfUse.wednesday')}
                  onChange={(e) => setValue('dateOfUse.wednesday', e.target.checked)}
                >
                  水
                </Checkbox>
                <Checkbox
                  defaultChecked
                  mr={2}
                  {...register('dateOfUse.thursday')}
                  onChange={(e) => setValue('dateOfUse.thursday', e.target.checked)}
                >
                  木
                </Checkbox>
                <Checkbox
                  defaultChecked
                  {...register('dateOfUse.friday')}
                  onChange={(e) => setValue('dateOfUse.friday', e.target.checked)}
                >
                  金
                </Checkbox>
              </Stack>
              <Spacer />
            </Flex>
          </Box>

          {/* 支援目標フォーム */}
          <Box backgroundColor='#FFFBDA' p='2' mb={8}>
            <Box mb='8' className='text_card'>
              <Text className='lead' fontSize='xl' m='4'>
                支援目標
              </Text>
              <Flex alignItems='center' m='4'>
                <Text w='20%'>支援目標 1:</Text>
                <Spacer />
                <Input
                  ml={2}
                  w='80%'
                  backgroundColor='#fff'
                  {...register('targetOfSupport.targetOfSupport1')}
                  onChange={(e) => setValue('targetOfSupport.targetOfSupport1', e.target.value)}
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
                  backgroundColor='#fff'
                  {...register('detailOfSupport.detailOfSupport1')}
                  onChange={(e) => setValue('detailOfSupport.detailOfSupport1', e.target.value)}
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
                  backgroundColor='#fff'
                  {...register('targetOfSupport.targetOfSupport2')}
                  onChange={(e) => setValue('targetOfSupport.targetOfSupport2', e.target.value)}
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
                  backgroundColor='#fff'
                  {...register('detailOfSupport.detailOfSupport2')}
                  onChange={(e) => setValue('detailOfSupport.detailOfSupport2', e.target.value)}
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
                  backgroundColor='#fff'
                  {...register('targetOfSupport.targetOfSupport3')}
                  onChange={(e) => setValue('targetOfSupport.targetOfSupport3', e.target.value)}
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
                  backgroundColor='#fff'
                  {...register('detailOfSupport.detailOfSupport3')}
                  onChange={(e) => setValue('detailOfSupport.detailOfSupport3', e.target.value)}
                  id='detailOfSupport3'
                />
              </Flex>
            </Box>
          </Box>
          
          <Flex>
            <Spacer />
            <Button colorScheme='teal' onClick={handleSubmit(onSubmitCustomer)}>
              <AddIcon mr='2' />
              利用者を追加する
            </Button>
          </Flex>
        </Box>

        {/* 利用者一覧 */}
        <Text className='head' fontSize='2xl'>
          利用者情報の編集
        </Text>
        <CustomerList
          allCustomersByService={allCustomersByService}
          handleCustomerClick={handleCustomerClick}
        />
      </Layout>
    </>
  );
}
