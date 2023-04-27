import { Button, FormLabel, Input, VStack, Box, Text, Link } from '@chakra-ui/react';

export const Header: React.FC = () => {
  return (
    <Box bg='#3778B8' w='100%' p={4} color='white' mb={100}>
      <Text fontSize='2xl'>Todo List</Text>
    </Box>
  );
};