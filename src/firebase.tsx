import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "@firebase/firestore";
import { getAuth } from "@firebase/auth";
import { getStorage } from "@firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAvBBLXbn4pQHZD2p43zqChuQDhqro16y0",
  authDomain: "estore-da964.firebaseapp.com",
  projectId: "estore-da964",
  storageBucket: "estore-da964.appspot.com",
  messagingSenderId: "459323555267",
  appId: "1:459323555267:web:0a20250359a039ac931176",
  measurementId: "G-5NMNE3V8QG",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
