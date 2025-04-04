// firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCWRHALoiCR7ZscJ4pYb8aS-F823f_qrFE",
  authDomain: "nftproject-37e39.firebaseapp.com",
  projectId: "nftproject-37e39",
  storageBucket: "nftproject-37e39.firebasestorage.app",
  messagingSenderId: "556894043250",
  appId: "1:556894043250:web:02f8482062cc7fa44596eb",
  measurementId: "G-TQ1ZXEYWT8",
};

// Initialize Firebase
let firebaseApp;

// Check if Firebase is already initialized
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  if (firebaseApp.name && typeof window !== "undefined") {
    getAnalytics(firebaseApp);
  }
} else {
  firebaseApp = getApps()[0]; // Use existing app if already initialized
}

const auth = getAuth(firebaseApp);

export { auth };
export default firebaseApp;
