import { Text } from '@chakra-ui/react'
import {useRouter} from 'next/router'

export default function detail(){
  const router = useRouter();
  const id = router.query

  return (
    <Text>編集ページです</Text>
  )
}