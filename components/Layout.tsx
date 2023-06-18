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

        {/* HOME */}
          <Text fontSize='l' color='blue'>
            HOME
          </Text>
        </Link>

        {/* 利用者詳細 */}
        <Link href='/customers/customer'>
          <Text fontSize='l' color='blue'>
            利用者詳細
          </Text>
        </Link>

        {/* 記録詳細 */}
        <Link href='/customers/records/record'>
          <Text fontSize='l' color='blue'>
            記録詳細
          </Text>
        </Link>

        {/* 利用者追加 */}
        <Link href='/administrator/addCustomer'>
          <Text fontSize='l' color='blue'>
            利用者追加
          </Text>
        </Link>
      </Box>
    </>
  );
}

export default Layout;
