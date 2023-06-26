export type Customer = {
  uid?: string;
  customerName: string;
  romaji: string;
  service: ServiceType;
  targetOfSupport1: string;
  targetOfSupport2: string;
  targetOfSupport3: string;
  detailOfSupport1: string;
  detailOfSupport2: string;
  detailOfSupport3: string;
};

export type ServiceType = '生活介護' | '多機能生活介護' | '就労継続支援B型';

export type CustomersByService = Record<ServiceType, Customer[]>;
