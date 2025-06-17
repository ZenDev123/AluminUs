import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyBMQgju0ekwv1R15NglrRnBHafMDsaiz7o",
  authDomain: "aluminus-4e20c.firebaseapp.com",
  projectId: "aluminus-4e20c",
  storageBucket: "aluminus-4e20c.appspot.com",
  messagingSenderId: "1035502666701",
  appId: "1:1035502666701:web:deb04f1441c090a64aba84",
  measurementId: "G-Q6RY788KY0"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();
const auth = getAuth(app);


export { db, storage, analytics, auth, provider };
