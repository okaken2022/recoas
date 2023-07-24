import { useEffect, useState } from 'react';
import { BasicInfoOfRecord } from '@/types/record';
import { collection, doc, getDoc } from 'firebase/firestore';
import { useToast } from '@chakra-ui/react';
import { db } from '@/hooks/firebase';


const useFetchBasicRecordInfo = (customerId: string, formattedMonth: string, formattedDate: string) => {
  const [loading, setLoading] = useState(true);
  const [basicInfoOfRecordData, setBasicInfoOfRecordData] = useState<BasicInfoOfRecord | null>(null);
  const toast = useToast();

  const fetchBasicRecordInfo = async () => {
    try {
      const recordsCollectionRef = collection(
        db,
        'customers',
        customerId,
        'monthlyRecords',
        formattedMonth,
        'dailyRecords',
      );
      const dailyDocumentRef = doc(recordsCollectionRef, formattedDate);
      const recordSnapshot = await getDoc(dailyDocumentRef);

      if (recordSnapshot.exists()) {
        const data = recordSnapshot.data() as BasicInfoOfRecord;
        setBasicInfoOfRecordData(data);
      }

      setLoading(false);
    } catch (e) {
      console.error(e);
      toast({
        title: 'データの取得に失敗しました。',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchBasicRecordInfo();

  }, [customerId, formattedMonth, formattedDate]);

  return { loading, basicInfoOfRecordData };
};

export default useFetchBasicRecordInfo;
