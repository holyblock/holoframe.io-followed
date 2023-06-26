import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { fbAK, fbAD, fbPI, fbSB, fbMSI, fbAI } from '../../../settings';

const appConfig = {
  apiKey: fbAK,
  authDomain: fbAD,
  projectId: fbPI,
  storageBucket: fbSB,
  messagingSenderId: fbMSI,
  appId: fbAI,
};

const app = initializeApp(appConfig);
const db = getFirestore(app);

export { db, doc, getDoc };