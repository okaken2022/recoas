const admin = require('firebase-admin');
const { Firestore } = require('@google-cloud/firestore');

// Firestoreエミュレーターの設定
const firestoreSettings = {
  host: 'localhost',
  port: 8081, // Firestoreエミュレーターのポート
  ssl: false, // SSL無効
};

// Firestoreエミュレーターに接続
const db = new Firestore(firestoreSettings);

// テストデータを追加
const testData = {
  collection: 'customers',
  document: 'your_document_id',
  data: {
    // ドキュメントのデータをここに設定
  },
};

// Firestoreにデータを追加
db.collection(testData.collection).doc(testData.document).set(testData.data)
  .then(() => {
    console.log('テストデータがFirestoreエミュレーターに追加されました');
  })
  .catch((error: any) => {
    console.error('エラー:', error);
  });
