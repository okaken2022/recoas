import { Box, Flex, Text, Select } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface MealAmountBoxProps {
  mealAmountValue: number;
  onChangeMealAmount: (value: number) => void;
}

const MealAmountBox: React.FC<MealAmountBoxProps> = ({ mealAmountValue, onChangeMealAmount }) => {
  const { register, setValue, reset } = useForm<{ mealAmount: number }>({
    defaultValues: {
      mealAmount: mealAmountValue,
    },
  });

  useEffect(() => {
    setValue('mealAmount', mealAmountValue);
  }, [mealAmountValue, setValue]);

  return (
    <Box p={2}>
      <Flex alignItems='center' justify='space-between'>
        <Text>昼食：</Text>
        <Select
          size={{ base: 'sm', md: 'md' }}
          width='40%'
          bg='white'
          {...register('mealAmount', {
            valueAsNumber: true, // 値を数値として扱う
          })}
          value={mealAmountValue} // ここで value を明示的に設定
          onChange={(e) => onChangeMealAmount(Number.parseInt(e.target.value, 10))}
        >
          <option value={0}>お休み</option>
          <option value={1}>1: 手をつけず</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
          <option value={6}>6</option>
          <option value={7}>7</option>
          <option value={8}>8</option>
          <option value={9}>9</option>
          <option value={10}>10: 完食</option>
        </Select>
      </Flex>
    </Box>
  );
};

export default MealAmountBox;
