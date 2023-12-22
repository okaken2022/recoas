import { Box, Flex, Input, Text, Spacer, FormErrorMessage } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface RecordHeaderProps {
  formattedDateJa: string;
  authorValue: string;
  onAuthorChange: (value: string) => void;
  authorError: string | undefined;
}

const RecordHeader: React.FC<RecordHeaderProps> = ({
  formattedDateJa,
  authorValue,
  onAuthorChange,
  authorError,
}) => {
  const { register, setValue } = useForm(); // useForm フックを使用
  // フォームの初期化時に setValue を使用して初期値を設定
  useEffect(() => {
    setValue('author', authorValue);
  }, [authorValue, setValue]);

  return (
    <Box bg='color.mainTransparent1' p={2}>
      <Flex alignItems='center'>
        {/* 日付 */}
        <Text fontSize={{ base: 'md', md: 'xl' }}>{formattedDateJa}</Text>
        <Spacer />

        {/* 記入者 */}
        <Text>支援員：</Text>
        <Input
          size={{ base: 'sm', md: 'md' }}
          width='30%'
          bg='white'
          type='text'
          id='author'
          {...register('author')} // フォームフィールドをバインド
          onChange={(e) => onAuthorChange(e.target.value)}
        />
        {authorError && <FormErrorMessage>{authorError}</FormErrorMessage>}
      </Flex>
    </Box>
  );
};

export default RecordHeader;
