export type Customer = {
  uid?: string;
  customerName: string;
  hurigana: string;
  service: ServiceType;
  recordFormat: string,
  dateOfUse: {
    Monday: boolean,
    Tuesday: boolean,
    Wednesday: boolean,
    Thursday: boolean,
    Friday: boolean,
  },
  targetOfSupport: {
    targetOfSupport1: string,
    targetOfSupport2: string,
    targetOfSupport3: string,
  },
  detailOfSupport: {
    detailOfSupport1: string,
    detailOfSupport2: string,
    detailOfSupport3: string,
  },
};

export type ServiceType = '生活介護' | '多機能生活介護' | '就労継続支援B型';

export type CustomersByService = Record<ServiceType, Customer[]>;
