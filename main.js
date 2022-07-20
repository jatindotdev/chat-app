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

const userImg = document.querySelector('section.login .data img.user-img');
const userName = document.querySelector('section.login .data h3.name');
const userEmail = document.querySelector('section.login .data p.email');
const loginButton = document.querySelector('section.login button.login');
const defaultLoginButton = loginButton.innerHTML;
const signOutButton = document.querySelector('section.login button.sign-out');
const loader = document.querySelector('.loader');

const signIn = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider).then((result) => setData(result.user));
};

const signOut = () => {
  auth.signOut();
  setData();
};

const continueToChat = () => {
  console.log('will continue to chat page!');
};

const setData = (user) => {
  userImg.src = user.photoURL ?? '/no-avatar.svg';
  userImg.style.display = 'block';
  userName.textContent = user.displayName;
  userName.style.display = 'block';
  userEmail.textContent = user.email;
  loginButton.innerHTML =
    'Continue <svg class="translate" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: white"><path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z"></path></svg>';
  loginButton.removeEventListener('click', signIn);
  loginButton.addEventListener('click', continueToChat);
  signOutButton.style.display = 'inherit';
  signOutButton.addEventListener('click', signOut);
};

const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    setData(user);
  } else {
    userImg.src = null;
    userImg.style.display = 'none';
    userName.textContent = null;
    userName.style.display = 'none';
    userEmail.textContent = "Maybe you're not logged in!";
    loginButton.innerHTML = defaultLoginButton;
    loginButton.removeEventListener('click', continueToChat);
    loginButton.addEventListener('click', signIn);
    signOutButton.style.display = 'none';
  }
  loader.style.display = 'none';
});
