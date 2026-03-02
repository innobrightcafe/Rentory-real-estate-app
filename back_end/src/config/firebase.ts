import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
// Make sure to provide GOOGLE_APPLICATION_CREDENTIALS in .env or via service account JSON
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'rentory-app.appspot.com',
  });
}

const db = admin.firestore();
const storage = admin.storage();

export { admin, db, storage };
