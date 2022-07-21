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

const root = document.querySelector('#app');
const userImg = document.querySelector('section.login .data img.user-img');
const userName = document.querySelector('section.login .data h3.name');
const loginSection = document.querySelector('section.login');
const chatSection = document.querySelector('section.chat');
const userEmail = document.querySelector('section.login .data p.email');
const loginButton = document.querySelector('section.login button.login');
const defaultLoginButton = loginButton.innerHTML;
const signOutButton = document.querySelector('section.login button.sign-out');
const bottomMsg = document.querySelector(
  'section.login .login-card span.bottom-msg'
);
const chats = document.querySelector('section.chat .chat-app .chat');
const chatDisplayPicture = document.querySelector(
  'section.chat .chat-app .sidebar .menu img.user-img'
);
const chatSignOutButton = document.querySelector(
  'section.chat .chat-app .sidebar .menu button.logout-button'
);
const loader = document.querySelector('.loader');

chats.append(
  createUser({
    displayName: 'AyaAya',
    photoURL:
      'https://pps.whatsapp.net/v/t61.24694-24/247123619_1187030705380254_1246475757011143598_n.jpg?ccb=11-4&oh=01_AVxdhEDvfBidLPccArCE_I8vMdVQo5_jjp0OLl0VNAVAEA&oe=62E9EA12',
    sentByUser: false,
    status: 'offline',
    recentMessage: 'aata hun 5min m',
  }),
  createUser({
    displayName: 'Flames',
    photoURL:
      'https://pps.whatsapp.net/v/t61.24694-24/224872162_319097646835545_2046865797955044402_n.jpg?ccb=11-4&oh=01_AVzyfnJxXES1X2C_F4x9dU6HBDcCdl2lJmKXq3aZmtJkmQ&oe=62E90710',
    sentByUser: true,
    status: 'online',
    recentMessage: 'dc aaja bro agar free hai',
  })
);

// remove chat section to add later
chatSection.remove();

const signIn = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider).then((result) => setData(result.user));
};

const signOut = () => {
  auth.signOut();
  loginSection.classList.remove('animate');
  root.append(loginSection);
  setTimeout(() => {
    chatSection.remove();
    loginSection.classList.add('animate');
  }, 0);
};

const continueToChat = () => {
  root.appendChild(chatSection);
  setTimeout(() => {
    loginSection.remove();
    chatSection.classList.add('animate');
  }, 0);
};

const setData = (user) => {
  userImg.src = user.photoURL ?? '/no-avatar.svg';
  userImg.style.display = 'block';
  userName.textContent = user.displayName;
  userName.style.display = 'block';
  userEmail.textContent = user.email;
  loginButton.innerHTML =
    'Continue <svg class="translate" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: white"><path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z"></path></svg>';
  bottomMsg.textContent = 'Press enter to continue';
  loginSection.classList.add('animate');
  loginButton.removeEventListener('click', signIn);
  loginButton.addEventListener('click', continueToChat);
  signOutButton.style.display = 'inherit';
  signOutButton.addEventListener('click', signOut);
  window.addEventListener(
    'keyup',
    (e) => e.key === 'Enter' && continueToChat()
  );
  chatDisplayPicture.src = user.photoURL;
  chatSignOutButton.addEventListener('click', signOut);
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
    bottomMsg.textContent = '';
    loginSection.classList.add('animate');
  }
  document.activeElement.blur();
  loader.remove();
});
