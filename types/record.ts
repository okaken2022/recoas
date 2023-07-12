export type BasicInfoOfRecord = {
  author: string;
  amWork: string;
  pmWork: string;
  timeAdjustment: number;
};

export type SingleRecord = {
  serialNumber: number | null;
  editor: string | null;
  situation: string;
  support: string;
  good: boolean;
  notice: boolean;
};
