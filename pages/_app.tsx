import '../styles/style.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from '../hooks/firebase';
import { theme } from '../styles/global';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </AuthProvider>
  );
}
