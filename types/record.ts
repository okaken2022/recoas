export type BasicInfoOfRecord = {
  author: string;
  amWork: string;
  pmWork: string;
  timeAdjustment: {
    amStartTimeHours: number;
    amStartTimeMinutes: number;
    amFinishTimeHours: number;
    amFinishTimeMinutes: number;
    pmStartTimeHours: number;
    pmStartTimeMinutes: number;
    pmFinishTimeHours: number;
    pmFinishTimeMinutes: number;
  };
};

export type SingleRecord = {
  serialNumber: number | null;
  editor: string | null;
  situation: string;
  support: string;
  good: boolean;
  notice: boolean;
};
