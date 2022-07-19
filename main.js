import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';

const app = initializeApp({
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: 'realtime-chat-app-41285.firebaseapp.com',
  projectId: 'realtime-chat-app-41285',
  storageBucket: 'realtime-chat-app-41285.appspot.com',
  messagingSenderId: '407034560466',
  appId: '1:407034560466:web:64f4efb3af287b4f8cd20b',
});

const userInfo = document.querySelector('section.login p');
const loginButton = document.querySelector('section.login button.login');
const defaultLoginButton = loginButton.innerHTML;
const signOutButton = document.querySelector('section.login button.sign-out');
const loader = document.querySelector('.loader');

const setData = (user) => {
  if (user) {
    userInfo.textContent = user.email;
    loginButton.textContent = 'Change User';
    signOutButton.style.display = 'block';
  } else {
    userInfo.textContent = "Maybe you're not logged in! Click to login";
    loginButton.innerHTML = defaultLoginButton;
    signOutButton.style.display = 'none';
  }
};

const signIn = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider).then((result) => {
    setData(result.user);
  });
};

const signOut = () => {
  auth.signOut();
  setData();
};

const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    setData(user);
    signOutButton.addEventListener('click', signOut);
  } else {
    loginButton.addEventListener('click', signIn);
  }
  loader.style.display = 'none';
});
