import { Button, Box, Select, Wrap, WrapItem, Text, Spinner, Center } from '@chakra-ui/react';
import { useAuth, db, AuthContext } from '@/hooks/firebase';
import { NextRouter, useRouter } from 'next/router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

import { useState, useContext, useEffect } from 'react';
import { AddIcon, CalendarIcon } from '@chakra-ui/icons';
import Layout from '@/components/Layout';
import { CustomersByService, ServiceType } from '@/types/customer';
import CustomerList from '@/components/CustomerList';

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
  const handleCustomerClick = (customerId: string | undefined) => {
    router.push(`/customers/${customerId}`);
  };

  const goToAddCustomer = () => {
    router.push('/administrator/addCustomer');
  };

  return (
    <>
      <Layout>
        {/* お知らせ */}
        <Text className='head' fontSize='2xl'>
          更新情報
        </Text>
        <Box mt='4' p='4'>
          <Text>2023/12/20 作業時間の記録方法を変更しました（工賃表ページは年内実装予定）</Text>
        </Box>

        {/* 利用者一覧 */}
        <Box mt='16'>
          <Text className='head' fontSize='2xl'>
            利用者一覧
          </Text>
        </Box>
        <CustomerList
          allCustomersByService={allCustomersByService}
          handleCustomerClick={handleCustomerClick}
        />

        {/* 管理者メニュー */}
        <Box mt='16'>
          <Text className='head' fontSize='2xl'>
            管理者メニュー
          </Text>
          <Wrap mt='4' spacing='3%' justify='center'>
            <WrapItem w={{ base: '100%', md: '30%' }}>
              <Button onClick={goToAddCustomer} w='100%'>
                <AddIcon mr='2' />
                利用者を追加する
              </Button>
            </WrapItem>
            <WrapItem w={{ base: '100%', md: '30%' }}>
              <Button isDisabled={true} w='100%'>
                ユーザー一覧
              </Button>
            </WrapItem>
            <WrapItem w={{ base: '100%', md: '30%' }}>
              <Button isDisabled={true} w='100%'>
                <CalendarIcon mr='2' />
                カレンダー設定
              </Button>
            </WrapItem>
          </Wrap>
        </Box>
      </Layout>
    </>
  );
}
