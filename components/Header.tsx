import { Box, Text, Flex } from '@chakra-ui/react';

export const Header: React.FC = () => {
  return (
    <Box bg='#3778B8' w='100%' p={4} color='white' mb={4}>
      <Text fontSize='2xl'>Todo List</Text>
    </Box>
  );
};
