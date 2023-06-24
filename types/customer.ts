export type Customer = {
  uid?: string;
  customerName: string;
  romaji: string;
  service: ServiceType;
};

export type ServiceType = '生活介護' | '多機能生活介護' | '就労継続支援B型';

export type CustomersByService = Record<ServiceType, Customer[]>;
