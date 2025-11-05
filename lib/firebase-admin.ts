import admin from 'firebase-admin';

const serviceAccount = require('./ServiceAccountKey.json') as admin.ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export const db = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;