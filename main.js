import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { createUser } from './utils/createUser';

const app = initializeApp({
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: 'chat-withme-firebase.firebaseapp.com',
  projectId: 'chat-withme-firebase',
  storageBucket: 'chat-withme-firebase.appspot.com',
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
});

// TODO mplement one to one chatting

const timeOut = {};

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
const chats = document.querySelector('section.chat .chat-app .user-chats');
const chatDisplayPicture = document.querySelector(
  'section.chat .chat-app .sidebar .menu img.user-img'
);
const chatSignOutButton = document.querySelector(
  'section.chat .chat-app .sidebar .menu button.logout-button'
);
const chatUserImg = document.querySelector(
  'section.chat .chat-app .chat-window .chat-header .chat-info .user-img'
);
const chatUserName = document.querySelector(
  'section.chat .chat-app .chat-window .chat-header .chat-info .user-data .user-name'
);
const chatUserStatus = document.querySelector(
  'section.chat .chat-app .chat-window .chat-header .chat-info .user-data .user-status'
);
const chatInputField = document.querySelector(
  'section.chat .chat-app .chat-window .chat-utils input'
);
const chatSendButton = document.querySelector(
  'section.chat .chat-app .chat-window .chat-utils button'
);
const chatList = document.querySelector(
  'section.chat .chat-app .chat-window .chat-list'
);
const loader = document.querySelector('.loader');

/*
  createUser({
    displayName,
    photoURL,
    sentByUser,
    status,
    recentMessage,
    chatUserName,
    chatUserImg,
    chatUserStatus,
  })
*/

// remove chat section to add later
chatSection.remove();

// Globals
const auth = getAuth(app);
const db = getFirestore(app);
const collectionRef = collection(db, 'messages');

const unsubscribeAuthState = onAuthStateChanged(auth, (user) => {
  if (user) {
    setData(user);
    loader.remove();
  } else {
    userImg.src = '';
    userImg.style.display = 'none';
    userName.textContent = '';
    userName.style.display = 'none';
    userEmail.textContent = "Maybe you're not logged in!";
    loginButton.innerHTML = defaultLoginButton;
    loginButton.removeEventListener('click', continueToChat);
    loginButton.addEventListener('click', signIn);
    signOutButton.style.display = 'none';
    bottomMsg.textContent = '';
    setTimeout(() => {
      loader.remove();
      loginSection.classList.add('animate');
    }, 500);
  }
  document.activeElement.blur();
});

const enterKeyEvent = (e) => {
  e.key === 'Enter' && continueToChat();
};

const chatEvents = (e) => {
  e.key === '/' && chatInputField.focus();
  e.key === 'Enter' && chatSendButton.click();
};

const mouseMoveEvent = () => {
  clearTimeout(timeOut.timer);
  window.addEventListener('keyup', enterKeyEvent);
  bottomMsg.textContent = 'Press enter to continue';
};

const signIn = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider).then((result) => setData(result.user));
};

const loadMessages = (messages) => {
  const messageNodes = [];
  let lastMessageUid;
  messages.forEach((message, i) => {
    const container = document.createElement('div');
    const messageClass =
      message.uid === auth.currentUser.uid ? 'sent' : 'received';
    container.classList.add(messageClass);
    let noTail;
    const isLast = i === messages.length - 1;
    if (messageClass === 'sent') {
      noTail = !isLast && messages[i + 1]?.uid === auth.currentUser.uid;
    } else if (messageClass === 'received') {
      if (lastMessageUid !== message.uid) noTail = true;
      else noTail = false;
      // if (lastMessageUid !== message.uid) {
      //   noTail = !isLast && messages[i + 1]?.uid !== lastMessageUid;
      // } else {
      // noTail = !isLast && messages[i + 1]?.uid !== auth.currentUser.uid;
      // }
    }
    // image
    const imageElement = new Image();
    imageElement.setAttribute(`height`, `45px`);
    imageElement.setAttribute(`width`, `45px`);
    imageElement.setAttribute(`alt`, ``);
    imageElement.src = message.photoURL ? message.photoURL : '/no-avatar.svg';

    // message span
    const span = document.createElement('span');
    span.classList.add('shared');
    span.classList.add(messageClass);
    if (noTail) {
      span.classList.add('noTail');
      container.classList.add('noTail');
    }
    span.textContent = message.text;
    messageClass === 'sent'
      ? noTail
        ? container.appendChild(span)
        : container.append(span, imageElement)
      : noTail
      ? container.appendChild(span)
      : container.append(imageElement, span);
    messageNodes.push(container);
    lastMessageUid = message.uid;
  });
  const scrollDiv = document.createElement('div');
  scrollDiv.classList.add('scrollTo');
  messageNodes.push(scrollDiv);
  chatList.replaceChildren(...messageNodes);
  document
    .querySelector(
      '#app > section > div > div.chat-window > div.chat-wrapper > div > div.scrollTo'
    )
    .scrollIntoView();
};

chatSendButton.addEventListener('click', () => {
  if (!chatInputField.value.trim()) return;
  const { uid, photoURL } = auth.currentUser;
  addDoc(collectionRef, {
    text: chatInputField.value.trim(),
    createdAt: serverTimestamp(),
    uid,
    photoURL,
  });
  chatInputField.value = null;
});

const continueToChat = () => {
  window.removeEventListener('mousemove', mouseMoveEvent);
  window.removeEventListener('keyup', enterKeyEvent);
  root.appendChild(chatSection);
  setTimeout(() => {
    loginSection.remove();
    chatSection.classList.add('animate');
  }, 0);
  onSnapshot(query(collectionRef, orderBy('createdAt')), (data) => {
    loadMessages(data.docs.map((message) => message.data()));
  });
  chatInputField.focus();
};

const signOut = () => {
  auth.signOut();
  window.removeEventListener('mousemove', mouseMoveEvent);
  window.removeEventListener('keyup', enterKeyEvent);
  loginSection.classList.remove('animate');
  root.append(loginSection);
  setTimeout(() => {
    chatSection.remove();
    loginSection.classList.add('animate');
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
  bottomMsg.textContent = 'Proceeding in a sec';
  loginSection.classList.add('animate');
  loginButton.removeEventListener('click', signIn);
  loginButton.addEventListener('click', continueToChat);
  signOutButton.style.display = 'inherit';
  signOutButton.addEventListener('click', signOut);
  timeOut.timer = setTimeout(continueToChat, 1000);
  window.addEventListener('mousemove', mouseMoveEvent);
  window.addEventListener('keyup', chatEvents);
  chatDisplayPicture.src = user.photoURL;
  chatSignOutButton.addEventListener('click', signOut);
};

window.addEventListener('beforeunload', () => {
  unsubscribeAuthState();
});
