import { Box, Flex, Input, Spacer, Text, Wrap } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Timestamp } from 'firebase/firestore';
import dayjs from 'dayjs';

interface BasicInfoOfRecord {
  author: string;
  amWork: string;
  pmWork: string;
  timeAdjustment: {
    amStartTime: Timestamp;
    amFinishTime: Timestamp;
    pmStartTime: Timestamp;
    pmFinishTime: Timestamp;
  };
}

export interface TimeAdjustmentBoxProps {
  onChangeTimeAdjustment: (value: BasicInfoOfRecord['timeAdjustment']) => void;
  timeAdjustment?: BasicInfoOfRecord['timeAdjustment'];
}

const TimeAdjustmentBox: React.FC<TimeAdjustmentBoxProps> = ({
  onChangeTimeAdjustment,
  timeAdjustment,
}) => {
  const { register, setValue } = useForm();
  const [amStartTime, setAmStartTime] = useState<string>('09:15');
  const [amFinishTime, setAmFinishTime] = useState<string>('12:00');
  const [pmStartTime, setPmStartTime] = useState<string>('13:30');
  const [pmFinishTime, setPmFinishTime] = useState<string>('15:45');

  useEffect(() => {
    if (timeAdjustment) {
      setAmStartTime(formatTimestampToTime(timeAdjustment.amStartTime) || '09:15');
      setAmFinishTime(formatTimestampToTime(timeAdjustment.amFinishTime) || '12:00');
      setPmStartTime(formatTimestampToTime(timeAdjustment.pmStartTime) || '13:30');
      setPmFinishTime(formatTimestampToTime(timeAdjustment.pmFinishTime) || '15:45');
    } else {
      // timeAdjustmentがない場合のデフォルト値を設定
      setAmStartTime('09:15');
      setAmFinishTime('12:00');
      setPmStartTime('13:30');
      setPmFinishTime('15:45');
    }
  }, [timeAdjustment]);

  const handleInputChange = (key: keyof BasicInfoOfRecord['timeAdjustment'], value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    const newTimestamp = Timestamp.fromDate(new Date(1970, 0, 1, hours, minutes));

    const updatedTimeAdjustment = {
      ...timeAdjustment,
      [key]: newTimestamp,
    } as BasicInfoOfRecord['timeAdjustment'];

    setValue(`timeAdjustment.${key}`, newTimestamp);
    onChangeTimeAdjustment(updatedTimeAdjustment);
  };

  const formatTimestampToTime = (timestamp?: Timestamp): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return dayjs(date).format('HH:mm');
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
              width={{ base: '80px', md: '108px' }}
              bg='white'
              type='time'
              id='amStartTime'
              value={amStartTime}
              onChange={(e) => {
                setAmStartTime(e.target.value);
                handleInputChange('amStartTime', e.target.value);
              }}
            />
            <Text>〜</Text>
            <Input
              size={{ base: 'sm', md: 'md' }}
              width={{ base: '80px', md: '108px' }}
              bg='white'
              type='time'
              id='amFinishTime'
              value={amFinishTime}
              onChange={(e) => {
                setAmFinishTime(e.target.value);
                handleInputChange('amFinishTime', e.target.value);
              }}
            />
          </Flex>
          <Flex alignItems='center' justify='right'>
            <Text ml={{ base: '0px', md: '20px' }}>午後：</Text>
            <Input
              size={{ base: 'sm', md: 'md' }}
              width={{ base: '80px', md: '108px' }}
              bg='white'
              type='time'
              id='pmStartTime'
              value={pmStartTime}
              onChange={(e) => {
                setPmStartTime(e.target.value);
                handleInputChange('pmStartTime', e.target.value);
              }}
            />
            <Text>〜</Text>
            <Input
              size={{ base: 'sm', md: 'md' }}
              width={{ base: '80px', md: '108px' }}
              bg='white'
              type='time'
              id='pmFinishTime'
              value={pmFinishTime}
              onChange={(e) => {
                setPmFinishTime(e.target.value);
                handleInputChange('pmFinishTime', e.target.value);
              }}
            />
          </Flex>
        </Wrap>
      </Flex>
    </Box>
  );
};

export default TimeAdjustmentBox;
