import Link from 'next/link';
import { Header } from './Header';
import { Box, Text } from '@chakra-ui/react';

function Layout({ children }: { children: any }): JSX.Element {
  return (
    <>
      <Header />
      <Box w={{ base: '100%', md: '80%' }} m='auto' p='4%'>
        {children}
      </Box>
    </>
  );
}

export default Layout;
