import { BasicInfoOfRecord } from '@/types/record';
import { Box, Flex, Input, Spacer, Text, Wrap } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export interface TimeAdjustmentBoxProps {
  onChangeTimeAdjustment: (value: BasicInfoOfRecord['timeAdjustment']) => void;
  timeAdjustmentValue?: BasicInfoOfRecord['timeAdjustment'];
}

const TimeAdjustmentBox: React.FC<TimeAdjustmentBoxProps> = ({
  onChangeTimeAdjustment,
  timeAdjustmentValue,
}) => {
  const { register, setValue, getValues } = useForm(); // useForm フックを使用

  // フォームの初期化時に setValue を使用して初期値を設定
  useEffect(() => {
    setValue('timeAdjustment', timeAdjustmentValue);
  }, [timeAdjustmentValue, setValue]);

  // 各Inputの値が変更されるたびにonChangeTimeAdjustmentを呼ぶ
  const handleInputChange = async (key: string, value: string) => {
    // 文字列から数値へ変換
    const numericValue = value !== '' ? parseInt(value, 10) : 0;
    // setValueをawaitで実行して非同期処理が完了するまで待つ
    await setValue(`timeAdjustment.${key}`, numericValue);
    // timeAdjustmentの最新の値を取得してonChangeTimeAdjustmentに渡す
    const updatedTimeAdjustment = getValues('timeAdjustment');
    onChangeTimeAdjustment(updatedTimeAdjustment);
  };

  return (
    <Box bg='white' p={2} borderBottom='1px solid #ddd'>
      <Flex alignItems='center' gap='2'>
        <Text>工賃</Text>
        <Spacer />
        <Wrap width='80%' justify='right'>
          <Flex alignItems='center' justify='right'>
            <Text>午前：</Text>
            <Input
              size={{ base: 'sm', md: 'md' }}
              width={{ base: '40px', md: '54px' }}
              bg='white'
              type='text'
              id='amStartTimeHours'
              defaultValue='9'
              {...register('timeAdjustment.amStartTimeHours')}
              // onChange={(e) => onChangeTimeAdjustment({
              //   ...timeAdjustmentValue,
              //   amStartTimeHours: parseInt(e.target.value, 10) // 文字列から数値へ変換
              // })}
              onChange={(e) => handleInputChange('amStartTimeHours', e.target.value)}
            />
            <Text>：</Text>
            <Input
              size={{ base: 'sm', md: 'md' }}
              width={{ base: '40px', md: '54px' }}
              bg='white'
              type='text'
              id='amStartTimeMinutes'
              defaultValue='30'
              {...register('timeAdjustment.amStartTimeMinutes')}
              onChange={(e) => handleInputChange('amStartTimeMinutes', e.target.value)}
            />
            <Text>〜</Text>
            <Input
              size={{ base: 'sm', md: 'md' }}
              width={{ base: '40px', md: '54px' }}
              bg='white'
              type='text'
              id='amFinishTimeHours'
              defaultValue='12'
              {...register('timeAdjustment.amFinishTimeHours')}
              onChange={(e) => handleInputChange('amFinishTimeHours', e.target.value)}
            />
            <Text>：</Text>
            <Input
              size={{ base: 'sm', md: 'md' }}
              width={{ base: '40px', md: '54px' }}
              bg='white'
              type='text'
              id='amFinishTimeMinutes'
              defaultValue='0'
              {...register('timeAdjustment.amFinishTimeMinutes')}
              onChange={(e) => handleInputChange('amFinishTimeMinutes', e.target.value)}
            />
          </Flex>
          <Flex alignItems='center' justify='right'>
            <Text ml={{ base: '0px', md: '20px' }}>午後：</Text>
            <Input
              size={{ base: 'sm', md: 'md' }}
              width={{ base: '40px', md: '54px' }}
              bg='white'
              type='text'
              id='pmStartTimeHours'
              defaultValue='13'
              {...register('timeAdjustment.pmStartTimeHours')}
              onChange={(e) => handleInputChange('pmStartTimeHours', e.target.value)}
            />
            <Text>：</Text>
            <Input
              size={{ base: 'sm', md: 'md' }}
              width={{ base: '40px', md: '54px' }}
              bg='white'
              type='text'
              id='pmStartTimeMinutes'
              defaultValue='30'
              {...register('timeAdjustment.pmStartTimeMinutes')}
              onChange={(e) => handleInputChange('pmStartTimeMinutes', e.target.value)}
            />
            <Text>〜</Text>
            <Input
              size={{ base: 'sm', md: 'md' }}
              width={{ base: '40px', md: '54px' }}
              bg='white'
              type='text'
              id='pmFinishTimeHours'
              defaultValue='15'
              {...register('timeAdjustment.pmFinishTimeHours')}
              onChange={(e) => handleInputChange('pmFinishTimeHours', e.target.value)}
            />
            <Text>：</Text>
            <Input
              size={{ base: 'sm', md: 'md' }}
              width={{ base: '40px', md: '54px' }}
              bg='white'
              type='text'
              id='pmFinishTimeMinutes'
              defaultValue='15'
              {...register('timeAdjustment.pmFinishTimeMinutes')}
              onChange={(e) => handleInputChange('pmFinishTimeMinutes', e.target.value)}
            />
          </Flex>
        </Wrap>
      </Flex>
    </Box>
  );
};

export default TimeAdjustmentBox;
