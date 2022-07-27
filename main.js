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
  setDoc,
  doc,
  getDoc,
  getDocs,
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
const globalData = {};

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
const toggleChatButton = document.querySelectorAll(
  'section.chat .chat-app button.open-chat'
);
const sidebar = document.querySelector('.sidebar');
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
const imgSelectButton = document.querySelector(
  'section.chat .chat-app .chat-window .chat-utils .chat-utils-b button.img-send-button'
);
const fileSelector = document.querySelector(
  'section.chat .chat-app .chat-window .chat-utils .chat-utils-b button.img-send-button input'
);
const chatSendButton = document.querySelector(
  'section.chat .chat-app .chat-window .chat-utils .chat-utils-b button.send-button'
);
const searchFilterInput = document.querySelector(
  'section.chat .chat-app .sidebar .search .input-field input'
);
const chatInputField = document.querySelector(
  '#app > section > div > div.chat-window > div.chat-utils > div > input'
);
const chatList = document.querySelector(
  'section.chat .chat-app .chat-window .chat-list'
);
const imagePreviewDiv = document.querySelector(
  '#app > section > div > div.chat-window > div.chat-utils > div.image-upload'
);
const previewImage = document.querySelector(
  '#app > section.chat > div > div.chat-window > div.chat-utils > div.image-upload > img'
);
const removeFilesButton = document.querySelector(
  '#app > section > div > div.chat-window > div.chat-utils > div.image-upload > div'
);
const previewImageDetail = document.querySelector(
  '#app > section > div > div.chat-window > div.chat-utils > div.image-upload > span'
);
const loader = document.querySelector('.loader');

// remove chat section to add later
chatSection.remove();

// Globals
const auth = getAuth(app);
const db = getFirestore(app);
const collectionRef = collection(db, 'messages');
let receiverUID = '';

const showToast = (
  message,
  { bottomOffset, timeOut } = { bottomOffset: '20px', timeOut: 3000 }
) => {
  const style = document.createElement('style');
  style.innerHTML = `
    .toast.show {
      opacity: 1;
      bottom: ${bottomOffset};
      transition: 0.4s;
    }
  `;
  document.getElementsByTagName('head')[0].appendChild(style);

  const toast = document.createElement('span');
  toast.classList.add('toast');
  toast.textContent = message;
  root.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 0);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 1000);
  }, timeOut);
};

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
  signInWithPopup(auth, provider)
    .then((result) => setData(result.user))
    .catch(() => showToast('Error: please login in!'));
};

const loadMessages = (messages) => {
  const filteredMessages = messages.filter((message) =>
    receiverUID
      ? (message.senderUID === auth.currentUser.uid &&
          message.receiverUID === receiverUID) ||
        (message.senderUID === receiverUID &&
          message.receiverUID === auth.currentUser.uid)
      : message.receiverUID === 'group'
  );
  const messageNodes = [];
  let lastMessageUid;
  filteredMessages.forEach((message, i) => {
    const container = document.createElement('div');
    const messageClass =
      message.senderUID === auth.currentUser.uid ? 'sent' : 'received';
    container.classList.add(messageClass);
    let noTail;
    const isLast = i === filteredMessages.length - 1;

    if (messageClass === 'sent') {
      noTail =
        !isLast && filteredMessages[i + 1]?.senderUID === auth.currentUser.uid;
    } else if (messageClass === 'received') {
      if (!isLast) {
        if (
          lastMessageUid !== message.senderUID &&
          filteredMessages[i + 1]?.senderUID !== message.senderUID
        )
          noTail = false;
        else if (
          lastMessageUid !== message.senderUID &&
          filteredMessages[i + 1]?.senderUID !== lastMessageUid
        )
          noTail = true;
        else if (lastMessageUid !== message.senderUID) noTail = false;
        else if (filteredMessages[i + 1]?.senderUID === lastMessageUid)
          noTail = true;
      } else noTail = false;
    }

    // image
    const userLogo = new Image();
    userLogo.classList.add('user-logo');
    userLogo.setAttribute(`height`, `45px`);
    userLogo.setAttribute(`width`, `45px`);
    userLogo.setAttribute(`alt`, ``);
    userLogo.src = message.photoURL ? message.photoURL : '/no-avatar.svg';
    const chatContainer = document.createElement('div');
    chatContainer.classList.add('chat-container');

    // if image is present
    if (message.imageURL) {
      const mDiv = document.createElement('div');
      mDiv.classList.add('chat-image-wrapper');

      const image = new Image();
      image.classList.add('chat-img');
      image.setAttribute(`alt`, `not found`);
      image.setAttribute('src', message.imageURL);
      mDiv.classList.add(messageClass);
      if (noTail) {
        mDiv.classList.add('noTail');
        container.classList.add('noTail');
      }

      mDiv.appendChild(image);
      chatContainer.appendChild(image);
    }
    if (message.text) {
      const span = document.createElement('span');
      span.classList.add('shared');
      span.classList.add(messageClass);
      if (noTail) {
        span.classList.add('noTail');
        container.classList.add('noTail');
      }
      span.textContent = message.text;
      chatContainer.appendChild(span);
    }
    messageClass === 'sent'
      ? noTail
        ? container.appendChild(chatContainer)
        : container.append(chatContainer, userLogo)
      : noTail
      ? container.appendChild(chatContainer)
      : container.append(userLogo, chatContainer);
    messageNodes.push(container);
    lastMessageUid = message.senderUID;
  });
  const scrollDiv = document.createElement('div');
  scrollDiv.classList.add('scrollTo');
  messageNodes.push(scrollDiv);
  chatList.replaceChildren(...messageNodes);
  setTimeout(() => {
    document
      .querySelector(
        '#app > section > div > div.chat-window > div.chat-wrapper > div > div.scrollTo'
      )
      .scrollIntoView();
  }, 100);
};

const loadChats = (users, inputVal) => {
  const chatsList = [];
  const filteredUsers = users.docs.filter((user) =>
    inputVal
      ? user.data().userName.toLowerCase().includes(inputVal) ||
        user.data().userEmail.includes(inputVal)
      : true
  );
  chatsList.push(
    createUser({
      displayName: 'Velle Log',
      userEmail: 'vellelog@group.com',
      userUID: null,
      status: 'online',
      isDefault: true,
      chatUserImg,
      chatUserName,
      chatUserStatus,
      changeReceiverUID: changeReceiverUID,
    })
  );
  filteredUsers.forEach((user) => {
    if (user.id === auth.currentUser.uid) return;
    const { userName: displayName, photoURL, userEmail } = user.data();
    chatsList.push(
      createUser({
        displayName,
        photoURL,
        userEmail,
        userUID: user.id,
        status: 'online',
        chatUserImg,
        chatUserName,
        chatUserStatus,
        changeReceiverUID: changeReceiverUID,
      })
    );
  });
  chats.replaceChildren(...chatsList);
};

const removeFiles = () => {
  fileSelector.value = null;
  imagePreviewDiv.style.display = 'none';
  previewImage.removeAttribute('src');
  previewImageDetail.textContent = '';
};

fileSelector.onchange = (e) => {
  if (!e.target.files[0]) return;
  if (e.target.files[0].size > 1048487) {
    showToast('Please select a file under 1 MB.', {
      bottomOffset: '87px',
      timeOut: 3000,
    });
    removeFiles();
  } else {
    const fileReader = new FileReader();
    previewImageDetail.textContent = e.target.files[0].name;
    fileReader.onloadend = (e) => {
      previewImage.setAttribute('src', e.target.result);
      imagePreviewDiv.style.display = 'block';
    };
    fileReader.readAsDataURL(e.target.files[0]);
  }
};

removeFilesButton.addEventListener('click', removeFiles);

imgSelectButton.addEventListener('click', () => {
  fileSelector.click();
});

chatSendButton.addEventListener('click', () => {
  const inputFieldValue = chatInputField.value.trim();
  const file = fileSelector.files[0];
  const { uid, photoURL } = auth.currentUser;
  if (!inputFieldValue && !file) return;
  if (file) {
    const fileReader = new FileReader();
    fileReader.onloadend = (e) => {
      addDoc(collectionRef, {
        text: inputFieldValue,
        imageURL: e.target.result ? e.target.result : '',
        createdAt: serverTimestamp(),
        senderUID: uid,
        photoURL,
        receiverUID: receiverUID ? receiverUID : 'group',
      });
    };
    fileReader.readAsDataURL(file);
    removeFiles();
  } else {
    addDoc(collectionRef, {
      text: inputFieldValue,
      imageURL: '',
      createdAt: serverTimestamp(),
      senderUID: uid,
      photoURL,
      receiverUID: receiverUID ? receiverUID : 'group',
    });
  }
  chatInputField.value = null;
});

const changeReceiverUID = async (UID) => {
  if (UID) receiverUID = UID;
  else receiverUID = '';
  loadMessages(globalData['messages'].docs.map((message) => message.data()));
  sidebar.classList.remove('active');
};

const continueToChat = () => {
  window.removeEventListener('mousemove', mouseMoveEvent);
  window.removeEventListener('keyup', enterKeyEvent);
  root.appendChild(chatSection);
  setTimeout(() => {
    loginSection.remove();
    chatSection.classList.add('animate');
  }, 0);
  onSnapshot(query(collectionRef, orderBy('createdAt')), (data) => {
    globalData['messages'] = data;
    loadMessages(data.docs.map((message) => message.data()));
  });
  onSnapshot(
    query(collection(db, 'users'), orderBy('loginDate', 'desc')),
    (users) => {
      globalData['users'] = users;
      loadChats(users);
    }
  );
  searchFilterInput.addEventListener('input', (e) =>
    loadChats(globalData['users'], e.currentTarget.value.toLowerCase())
  );
  chatInputField.focus();
};

const signOut = () => {
  auth.signOut();
  showToast("You're logged out of your session!");
  window.removeEventListener('mousemove', mouseMoveEvent);
  window.removeEventListener('keyup', enterKeyEvent);
  loginSection.classList.remove('animate');
  root.append(loginSection);
  setTimeout(() => {
    chatSection.remove();
    loginSection.classList.add('animate');
  }, 0);
};

const setData = async (user) => {
  const docSnap = await getDoc(doc(db, 'users', user.uid));
  if (!docSnap.exists()) {
    setDoc(doc(db, 'users', user.uid), {
      userName: user.displayName,
      userEmail: user.email,
      photoURL: user.photoURL,
      loginDate: serverTimestamp(),
    });
  }
  showToast(`Welcome back, ${user.displayName}!`, {
    timeOut: 1000,
    bottomOffset: '20px',
  });
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
  toggleChatButton.forEach((toggleButton) => {
    toggleButton.addEventListener('click', () => {
      sidebar.classList.contains('active')
        ? sidebar.classList.remove('active')
        : sidebar.classList.add('active');
    });
  });
  timeOut.timer = setTimeout(continueToChat, 1000);
  window.addEventListener('mousemove', mouseMoveEvent);
  window.addEventListener('keyup', chatEvents);
  chatDisplayPicture.src = user.photoURL;
  chatSignOutButton.addEventListener('click', signOut);
};

window.addEventListener('beforeunload', () => {
  unsubscribeAuthState();
});
