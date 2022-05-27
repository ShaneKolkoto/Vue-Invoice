import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDkv-zfQNSr_l6yRXAvan5u-22dAw5opf4",
  authDomain: "invoice-app-d9aa8.firebaseapp.com",
  projectId: "invoice-app-d9aa8",
  storageBucket: "invoice-app-d9aa8.appspot.com",
  messagingSenderId: "1033543859578",
  appId: "1:1033543859578:web:0578d538c67c82f97aeac3",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebaseApp.firestore();
