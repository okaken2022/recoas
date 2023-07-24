// useFetchSingleRecord.ts

import { useEffect, useState } from 'react';
import { collection, doc, getDoc, query, orderBy, getDocs } from 'firebase/firestore';
import { SingleRecord } from '@/types/record';
import { db } from './firebase';

const useFetchSingleRecord = (customerId: string, formattedMonth: string, formattedDate: string) => {
  const [singleRecordData, setSingleRecordData] = useState<{ docId: string; data: SingleRecord }[]>([]);

  const fetchSingleRecord = async () => {
    try {
      const singleRecordCollectionRef = collection(
        db,
        'customers',
        customerId,
        'monthlyRecords',
        formattedMonth,
        'dailyRecords',
        formattedDate,
        'singleRecord',
      );
      const singleRecordQuerySnapshot = await getDocs(query(singleRecordCollectionRef, orderBy('serialNumber')));

      const records = singleRecordQuerySnapshot.docs.map((doc) => {
        const docId = doc.id;
        const data = doc.data() as SingleRecord;
        return { docId, data };
      });

      setSingleRecordData(records);
    } catch (error) {
      console.error('Error fetching single records:', error);
    }
  };
  useEffect(() => {
    fetchSingleRecord();

  }, [customerId, formattedMonth, formattedDate]);

  return singleRecordData;
};

export default useFetchSingleRecord;
