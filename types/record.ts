export type BasicInfoOfRecord = {
  author: string;
  amWork: string;
  pmWork: string;
  timeAdjustment: number;
};

export type SingleRecord = {
  serialNumber: number;
  editor: string;
  situation: string;
  support: string;
  good: boolean;
  notice: boolean;
};
