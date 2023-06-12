import Link from "next/link";
import { Header } from "./Header";
import { Box, Text } from "@chakra-ui/react";



function Layout({ children }: {
  children: any;
}): JSX.Element {
  return (
    <>
      <Header />
      <Box  w={{ base: '100%', md: '80%' }} m='auto' p='4%'>
        { children }
        {/* 開発用リンク */}
        <Text fontSize='2xl'  mt='20'>
          開発用リンク
        </Text>
        <Link href='/home'>
          <Text fontSize='l' color='blue'>
            HOME
          </Text>
        </Link>
        <Link href='/customers/customer'>
          <Text fontSize='l' color='blue'>
            記録一覧
          </Text>
        </Link>
      </Box>
    </>
  );
}

export default Layout;
