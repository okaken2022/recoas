// 1. Import `extendTheme`
import { extendTheme } from "@chakra-ui/react"

// 2. Call `extendTheme` and pass your custom values
export const theme = extendTheme({
  colors: {
    color: {
      main: "#0F9954",
      mainTransparent : "rgba(15, 153, 84, 0.3)",
      sub: "#1a202c",
    },
  },
  fonts: {
    heading: "'Zen Maru Gothic', sans-serif",
    body: "'Zen Maru Gothic', sans-serif",
    logo: "'Montserrat',  sans-serif",
  }
})

