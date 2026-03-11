import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBHjjQaatGJStLVpc9J76COpFNMUb6yM5s",
  authDomain: "tagturn-5cb36.firebaseapp.com",
  projectId: "tagturn-5cb36",
  storageBucket: "tagturn-5cb36.firebasestorage.app",
  messagingSenderId: "121147802392",
  appId: "1:121147802392:web:b73aed0df8ca42c444946d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
