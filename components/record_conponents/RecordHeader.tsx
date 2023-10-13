import { Box, Flex, Input, Text, Spacer, FormErrorMessage } from '@chakra-ui/react';

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
          value={authorValue}
          onChange={(e) => onAuthorChange(e.target.value)}
        />
        {authorError && <FormErrorMessage>{authorError}</FormErrorMessage>}
      </Flex>
    </Box>
  );
};

export default RecordHeader;
