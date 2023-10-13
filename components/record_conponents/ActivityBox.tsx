import { Box, Flex, Input, Text, Wrap, Spacer } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface ActivityBoxProps {
  amWorkValue: string;
  pmWorkValue: string;
  onChangeAmWork: (value: string) => void;
  onChangePmWork: (value: string) => void;
}

const ActivityBox: React.FC<ActivityBoxProps> = ({
  amWorkValue,
  pmWorkValue,
  onChangeAmWork,
  onChangePmWork,
}) => {
  const { register, setValue } = useForm(); // useForm フックを使用

  // フォームの初期化時に setValue を使用して初期値を設定
  useEffect(() => {
    setValue('amWork', amWorkValue);
    setValue('pmWork', pmWorkValue);
  }, [amWorkValue, pmWorkValue, setValue]);

  return (
    <Box bg='white' p={2} borderBottom='1px solid #ddd'>
      <Flex alignItems='center'>
        <Box>
          <Text>活動</Text>
        </Box>
        <Spacer />
        <Wrap width='80%' justify='right'>
          <Flex alignItems='center' justify='right'>
            <Text>午前：</Text>
            <Input
              size={{ base: 'sm', md: 'md' }}
              width='60%'
              bg='white'
              type='text'
              id='amWork'
              {...register('amWork')} // フォームフィールドをバインド
              onChange={(e) => onChangeAmWork(e.target.value)}
            />
          </Flex>
          <Flex alignItems='center' justify='right'>
            <Text>午後：</Text>
            <Input
              size={{ base: 'sm', md: 'md' }}
              width='60%'
              bg='white'
              type='text'
              id='pmWork'
              {...register('pmWork')} // フォームフィールドをバインド
              onChange={(e) => onChangePmWork(e.target.value)}
            />
          </Flex>
        </Wrap>
      </Flex>
    </Box>
  );
};

export default ActivityBox;
