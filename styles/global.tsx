// 1. Import `extendTheme`
import { extendTheme } from '@chakra-ui/react';

// 2. Call `extendTheme` and pass your custom values
export const theme = extendTheme({
  styles: {
    global: {
      body: {
        backgroundColor: '#FFFAFAF',
      },
    },
  },
  colors: {
    color: {
      main: '#0F9954',
      mainTransparent1: 'rgba(15, 153, 84, 0.5)',
      mainTransparent2: 'rgba(15, 153, 84, 0.2)',
      sub: '#1a202c',
    },
  },
  fonts: {
    heading: "'Zen Maru Gothic', sans-serif",
    body: "'Zen Maru Gothic', sans-serif",
    logo: "'Montserrat',  sans-serif",
  },
});
