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
      <Box bg='#3778B8' w='100%' p={4}>
        <Flex minWidth='max-content' color='white' alignItems='center' gap='2'>
          <Link href='/'>
            <Text fontSize='2xl'>Todo List</Text>
          </Link>
          <Spacer />

          <Button ml='20px' colorScheme='teal' onClick={logout}>
            ログアウト
          </Button>
        </Flex>
      </Box>
      <Box p={4} mb={8}>
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
    </>
  );
};
