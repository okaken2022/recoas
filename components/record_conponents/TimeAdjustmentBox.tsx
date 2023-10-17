import { Box, Flex, Input, Spacer, Text, RadioGroup, Radio, Stack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface TimeAdjustmentBoxProps {
  isCustomTime: boolean;
  onRadioChange: (value: string) => void;
  onChangeTimeAdjustment: (value: number) => void;
  timeAdjustmentValue: number | undefined;
}

const TimeAdjustmentBox: React.FC<TimeAdjustmentBoxProps> = ({
  isCustomTime,
  onRadioChange,
  onChangeTimeAdjustment,
  timeAdjustmentValue,
}) => {
  const { register, setValue } = useForm(); // useForm フックを使用

  // フォームの初期化時に setValue を使用して初期値を設定
  useEffect(() => {
    setValue('timeAdjustment', timeAdjustmentValue);
  }, [timeAdjustmentValue, setValue]);

  return (
    <Box bg='white' p={2} borderBottom='1px solid #ddd'>
      <Flex alignItems='center' gap='2'>
        <Text>工賃</Text>
        <Spacer />
        <RadioGroup onChange={onRadioChange} value={isCustomTime ? '変更' : '通常'}>
          <Stack spacing={3} direction='row'>
            <Radio colorScheme='green' defaultChecked value='通常'>
              通常
            </Radio>
            <Radio colorScheme='red' value='変更'>
              変更
            </Radio>
          </Stack>
        </RadioGroup>
        <Input
          size={{ base: 'sm', md: 'md' }}
          placeholder='0'
          width='64px'
          bg='white'
          type='text'
          id='timeAdjustment'
          {...register('timeAdjustment')}
          defaultValue={0}
          readOnly={!isCustomTime}
          onChange={(e) => onChangeTimeAdjustment(e.target.valueAsNumber)}
        />
        分
      </Flex>
    </Box>
  );
};

export default TimeAdjustmentBox;
