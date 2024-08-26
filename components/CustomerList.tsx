import { Wrap, WrapItem, Select } from '@chakra-ui/react';
import type { CustomersByService, Customer } from '@/types/customer';

interface ServiceListProps {
  service: keyof CustomersByService;
  customers: Customer[];
  handleCustomerClick: (customerId: string | undefined) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ service, customers, handleCustomerClick }) => {
  return (
    <WrapItem w={{ base: '100%', md: '30%' }} key={service}>
      <Select
        w='100%'
        placeholder={service}
        bg={getServiceBackgroundColor(service)}
        onChange={(event) => handleCustomerClick(event.target.value)}
      >
        {customers.map((customer) => (
          <option value={customer.uid} key={customer.uid}>
            {customer.customerName}
          </option>
        ))}
      </Select>
    </WrapItem>
  );
};

interface CustomerListProps {
  allCustomersByService: CustomersByService;
  handleCustomerClick: (customerId: string | undefined) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  allCustomersByService,
  handleCustomerClick,
}) => {
  return (
    <Wrap mt='4' spacing='8px' justify='center'>
      {Object.entries(allCustomersByService).map(([service, customers]) => (
        <ServiceList
          service={service as keyof CustomersByService}
          customers={customers}
          handleCustomerClick={handleCustomerClick}
          key={service}
        />
      ))}
    </Wrap>
  );
};

function getServiceBackgroundColor(service: string) {
  switch (service) {
    case '生活介護':
      return 'red.200';
    case '多機能生活介護':
      return 'blue.200';
    case '就労継続支援B型':
      return 'green.200';
    default:
      return 'gray.200';
  }
}

export default CustomerList;
