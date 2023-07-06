// customerの型を定義
export type CustomerInfoType = {
  customerName: string;
  targetOfSupport1: string;
  detailOfSupport1: string;
  targetOfSupport2: string;
  detailOfSupport2: string;
  targetOfSupport3: string;
  detailOfSupport3: string;
};

export type CustomerInfoProps = {
  customer: CustomerInfoType; // customerの型を指定
};
