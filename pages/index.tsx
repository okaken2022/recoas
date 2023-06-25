import { Button, Box, Select, Wrap, WrapItem, Text } from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

import { useState, useContext, useEffect } from 'react';
import { Todo, firestoreTodo } from '@/types/todo';
import { AddIcon, CalendarIcon } from '@chakra-ui/icons';
import Layout from '@/components/Layout';
import { Customer, CustomersByService, ServiceType } from '@/types/customer';

export default function Home() {
  const [allCustomersByService, setAllCustomersByService] = useState<CustomersByService>({
    生活介護: [],
    多機能生活介護: [],
    就労継続支援B型: [],
  });

  {
    /* ログイン */
  }
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);
  const router: NextRouter = useRouter();

  {
    /* サービスごとに分けた配列を持つオブジェクトを作成 */
  }
  useEffect(() => {
    if (!currentUser) return;
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
          romaji: doc.data().romaji,
          service: doc.data().service as ServiceType,
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
    /* 利用者名をクリックして、記録一覧ページに遷移 */
  }
  const handleCustomerClick = (
    customerId: string | undefined
  ) => {
    console.log(customerId)
    router.push(`/customers/${customerId}`);
  };

  
  {
    /* サービスごとに異なる背景色をあてる */
  }
  function getServiceBackgroundColor(service: string) {
    switch (service) {
      case '生活介護':
        return 'red.200';
      case '多機能生活介護':
        return 'blue.200';
      case '就労継続支援B型':
        return 'green.200';
      default:
        return 'gray.200';
    }
  }
  
  return (
    <>
      <Layout>
        {/* お知らせ */}
        <Text className='head' fontSize='2xl'>お知らせ</Text>
        <Box mt='4' p='4'>
          <Text>4/28 田中さんの午前の記録がありません。</Text>
          <Text>4/28 田中さんの工賃の記録がありません。</Text>
          <Text>4/28 田中さんの記録がありません。</Text>
        </Box>

        {/* 利用者一覧 */}
        <Box mt='20'>
          <Text className='head' fontSize='2xl'>利用者一覧</Text>
        </Box>
        <Wrap mt='4' spacing='3%' justify='center'>
          {Object.entries(allCustomersByService).map(([service, customers]) => (
            <WrapItem w={{ base: '100%', md: '30%' }} key={service}>
              <Select
              w='100%'
              placeholder={service}
              bg={getServiceBackgroundColor(service)}
              onChange={(event) => handleCustomerClick(event.target.value)}
              >
                {customers.map((customer) => (
                  <option
                  value={customer.uid}
                  key={customer.uid}
                  
                  >
                    {customer.customerName}
                  </option>
                ))}
              </Select>
            </WrapItem>
          ))}
        </Wrap>

        {/* 管理者メニュー */}
        <Box mt='20'>
          <Text className='head' fontSize='2xl'>管理者メニュー</Text>
          <Wrap mt='4' spacing='3%' justify='center'>
            <WrapItem w={{ base: '100%', md: '30%' }}>
              <Button w='100%'>
                {/* <FontAwesomeIcon icon={faUser}>
                  <i className="fa-solid fa-user" />
                </FontAwesomeIcon> */}
                ユーザー一覧
              </Button>
            </WrapItem>
            <WrapItem w={{ base: '100%', md: '30%' }}>
              <Button w='100%'>
                <CalendarIcon mr='2'/>
                カレンダー設定
              </Button>
            </WrapItem>
            <WrapItem w={{ base: '100%', md: '30%' }}>
              <Button w='100%'>
                <AddIcon mr='2' />
                利用者を追加する
              </Button>
            </WrapItem>
          </Wrap>
        </Box>
      </Layout>
    </>
  );
}
