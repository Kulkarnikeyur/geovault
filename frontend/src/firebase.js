// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtHRehms9Xt1QaK7lj-nPqMjdUTg_ajKQ",
  authDomain: "geovault-5becd.firebaseapp.com",
  projectId: "geovault-5becd",
  storageBucket: "geovault-5becd.firebasestorage.app",
  messagingSenderId: "988282710291",
  appId: "1:988282710291:web:00fff3134f19a6757cd2e6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();