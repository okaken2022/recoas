import React from 'react';
import { Heading, Spacer, VStack, Text } from '@chakra-ui/react';
import { CustomerInfoProps } from '@/types/customerInfo';


const CustomerInfo: React.FC<CustomerInfoProps>  = ({ customer }) => {
  return (
    <>
      <Heading className='title' color='color.sub' as='h2' mb='8' size='xl' noOfLines={1}>
        {customer.customerName}さん
      </Heading>
      {/* 支援目標 */}
      <Text className='head' fontSize='2xl'>
        支援目標
      </Text>
      <VStack align='start' w='100%' h='auto' m='auto' mt='4' mb='20' p='4'>
        <Text className='lead' fontSize='xl'>
          1. {customer.targetOfSupport1}
        </Text>
        <Text>{customer.detailOfSupport1}</Text>
        <Spacer />
        <Text className='lead' fontSize='xl'>
          2. {customer.targetOfSupport2}
        </Text>
        <Text>{customer.detailOfSupport2}</Text>
        {customer.targetOfSupport3 !== '' && (
          <>
            <Text className='lead' fontSize='xl'>
              3. {customer.targetOfSupport2}
            </Text>
            <Text>{customer.detailOfSupport3}</Text>
          </>
        )}
      </VStack>
    </>
  );
};

export default CustomerInfo;