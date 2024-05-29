import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initializeApp } from 'firebase/app';
import 'firebase/database'; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0jBJcDcmDmSzaoxDLbAoIrs4SqJQOGVI",
  authDomain: "dart-70ff4.firebaseapp.com",
  databaseURL: "https://dart-70ff4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dart-70ff4",
  storageBucket: "dart-70ff4.appspot.com",
  messagingSenderId: "769498204464",
  appId: "1:769498204464:web:c8c9ebefd1590787a4e0f5"
};

// Initialize Firebase
initializeApp(firebaseConfig);
// Initialize Database

createApp(App).use(router).mount('#app');
