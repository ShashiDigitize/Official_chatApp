import firebase from 'firebase';
import 'firebase/storage';
const config = {
  apiKey: "AIzaSyCpjSisGMYrvBXOLKQ4ULaeNmK5zU_8K-w",
  authDomain: "shashichatapp.firebaseapp.com",
  databaseURL: "https://shashichatapp-default-rtdb.firebaseio.com",
  projectId: "shashichatapp",
  storageBucket: "shashichatapp.appspot.com",
  messagingSenderId: "837915550458",
  appId: "1:837915550458:web:df32edf2030c97e2159f43"
  };
firebase.initializeApp(config);
const storage = firebase.storage();
const db = firebase.database();


export { storage,db, firebase as default};