import { AuthContext, useAuth, useLogout } from '@/hooks/firebase';
import { Box, Text, Flex, Spacer, Button } from '@chakra-ui/react';
import Link from 'next/link';
import { NextRouter, useRouter } from 'next/router';
import { useContext } from 'react';

export const Header: React.FC = () => {
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);

  const router: NextRouter = useRouter();
  const { logout } = useLogout(router);

  return (
    <>
      <Box bg='color.main' w='100%' p={4}>
        <Flex minWidth='max-content' color='white' alignItems='center' gap='2'>
          <Link href='/home'>
            <Text className='logo' fontSize='2xl'>
              recoAs
            </Text>
          </Link>
          <Spacer />

          <Button ml='20px' colorScheme='#fff' onClick={logout}>
            ログアウト
          </Button>
        </Flex>
      </Box>
      <Flex>
        <Spacer />
        {/* ログイン状態 */}
        <Box p={4} mb={{ base: '0', md: '8' }}>
          {user ? (
            <Text color='teal' fontWeight='bold' fontSize='s'>
              ログイン中:{user?.email}
            </Text>
          ) : (
            <Text color='teal' fontWeight='bold' fontSize='s'>
              未ログイン
            </Text>
          )}
        </Box>
      </Flex>
    </>
  );
};
