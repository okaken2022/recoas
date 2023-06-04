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
    <Box bg='#3778B8' w='100%' p={4} mb={100}>
      <Flex minWidth='max-content' color='white' alignItems='center' gap='2'>
        <Link href='/'>
          <Text fontSize='2xl'>Todo List</Text>
        </Link>
        <Spacer />
        {user ? (
          <Text fontSize='xl'>ログイン中:{user?.email}</Text>
        ) : (
          <Text fontSize='xl'>未ログイン</Text>
        )}
        <Button  ml='20px' colorScheme='teal' onClick={logout}>
          ログアウト
        </Button>
      </Flex>
    </Box>
  );
};
