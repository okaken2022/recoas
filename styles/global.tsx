// 1. Import `extendTheme`
import { extendTheme } from "@chakra-ui/react"

// 2. Call `extendTheme` and pass your custom values
export const theme = extendTheme({
  colors: {
    color: {
      main: "#0F9954",
      sub: "#1a202c",
    },
  },
})
