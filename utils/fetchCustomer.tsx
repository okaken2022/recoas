import { collection, query, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/hooks/firebase';
import { CustomerInfoType } from '@/types/customerInfo';

export const fetchCustomer = async (customerId: string, callback: (customer: CustomerInfoType) => void) => {
  const q = query(collection(db, 'customers'), orderBy('romaji', 'asc'));
  const unSub = onSnapshot(q, (snapshot) => {
    snapshot.docs.forEach((doc) => {
      const customerData = doc.data(); // Firestoreからデータを取得

      if (doc.id === customerId) {
        const formattedCustomer: CustomerInfoType = {
          customerName: customerData.customerName,
          targetOfSupport1: customerData.targetOfSupport1,
          detailOfSupport1: customerData.detailOfSupport1,
          targetOfSupport2: customerData.targetOfSupport2,
          detailOfSupport2: customerData.detailOfSupport2,
          targetOfSupport3: customerData.targetOfSupport3,
          detailOfSupport3: customerData.detailOfSupport3,
        };
        callback(formattedCustomer);
      }
    });
  });

  return () => {
    unSub();
  };
};