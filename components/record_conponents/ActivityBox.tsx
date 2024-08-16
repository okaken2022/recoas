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
  const { register, setValue, reset } = useForm<{ amWork: string; pmWork: string }>({
    defaultValues: {
      amWork: amWorkValue,
      pmWork: pmWorkValue,
    },
  });

  useEffect(() => {
    reset({
      amWork: amWorkValue,
      pmWork: pmWorkValue,
    });
  }, [amWorkValue, pmWorkValue, reset]);

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
