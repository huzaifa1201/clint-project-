
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDJZSuUA72Zp_o8BlAmb5nt2xKGF4rF9iU",
  authDomain: "googlu-chatting-app.firebaseapp.com",
  databaseURL: "https://googlu-chatting-app-default-rtdb.firebaseio.com",
  projectId: "googlu-chatting-app",
  messagingSenderId: "144795510133",
  appId: "1:144795510133:web:577549289d48c0d4369f3c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;