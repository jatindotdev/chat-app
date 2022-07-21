const createUser = ({
  displayName,
  photoURL,
  status,
  recentMessage,
  sentByUser,
  chatUserName,
  chatUserImg,
  chatUserStatus,
}) => {
  // user div
  const user = document.createElement('div');
  user.classList.add('user');

  // user image div
  const userImg = document.createElement('div');
  userImg.classList.add('user-img');

  // user display picture
  const imageElement = new Image();
  imageElement.setAttribute(`height`, `50px`);
  imageElement.setAttribute(`width`, `50px`);
  imageElement.src = photoURL ? photoURL : '/no-avatar.svg';
  imageElement.setAttribute(`alt`, ``);

  // user info div
  const userInfo = document.createElement('div');
  userInfo.classList.add('user-info');

  // top row div
  const topRow = document.createElement('div');
  topRow.classList.add('top-row');

  // user display name
  const userDisplayName = document.createElement('p');
  userDisplayName.classList.add('user-name');
  userDisplayName.textContent += displayName ? displayName : 'no name';

  // user status span
  const userStatus = document.createElement('span');
  userStatus.classList.add('user-status');
  if (status == 'online') userStatus.classList.add('online');
  userStatus.textContent += status ? status : '';

  // bottom row div
  const bottomRow = document.createElement('div');
  bottomRow.classList.add('bottom-row');

  // arrow Svg
  const arrowSvg = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  if (!sentByUser) arrowSvg.classList.add('hidden');
  arrowSvg.setAttribute('width', '24');
  arrowSvg.setAttribute('height', '24');
  arrowSvg.setAttribute('viewBox', '0 0 24 24');

  // arrow Svg Path attrib
  const arrowSvgPath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  );
  arrowSvgPath.setAttribute(
    'd',
    'm2.394 13.742 4.743 3.62 7.616-8.704-1.506-1.316-6.384 7.296-3.257-2.486zm19.359-5.084-1.506-1.316-6.369 7.279-.753-.602-1.25 1.562 2.247 1.798z'
  );

  // paragraph element
  const pElement = document.createElement('p');
  pElement.classList.add('recent-message');
  pElement.textContent += recentMessage ? recentMessage : `start some chat`;

  // appending all element
  user.appendChild(userImg);
  userImg.appendChild(imageElement);
  user.appendChild(userInfo);
  userInfo.appendChild(topRow);
  topRow.appendChild(userDisplayName);
  topRow.appendChild(userStatus);
  userInfo.appendChild(bottomRow);
  bottomRow.appendChild(arrowSvg);
  arrowSvg.appendChild(arrowSvgPath);
  bottomRow.appendChild(pElement);

  user.addEventListener('click', (e) => {
    document
      .querySelectorAll('section.chat .chat-app .sidebar .chat .user')
      .forEach(
        (user) =>
          user.classList.contains('active') && user.classList.remove('active')
      );
    e.currentTarget.classList.add('active');
    chatUserImg.src = e.currentTarget.querySelector('.user-img img').src;
    chatUserName.textContent =
      e.currentTarget.querySelector('p.user-name').textContent;
    chatUserStatus.classList =
      e.currentTarget.querySelector('span.user-status').classList;
    chatUserStatus.textContent =
      e.currentTarget.querySelector('span.user-status').textContent;

    // always call these function
    document
      .querySelector(
        '#app > section > div > div.chat-window > div.chat-utils > input[type=text]'
      )
      .removeAttribute('disabled');
    document
      .querySelector(
        '#app > section > div > div.chat-window > div.chat-utils > input[type=text]'
      )
      .focus();
  });
  return user;
};

// Template

// <div class="user">
//   <div class="user-img">
//     <img height="55px" width="55px" src="/no-avatar.svg" alt="" />
//   </div>
//   <div class="user-info">
//     <div class="top-row">
//       <p class="user-name">Jatin Kumar</p>
//       <div class="user-status">online</div>
//     </div>
//     <div class="bottom-row">
//       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
//         <path d="m2.394 13.742 4.743 3.62 7.616-8.704-1.506-1.316-6.384 7.296-3.257-2.486zm19.359-5.084-1.506-1.316-6.369 7.279-.753-.602-1.25 1.562 2.247 1.798z"></path>
//       </svg>
//       <p class="recent-message">hey! dude</p>
//     </div>
//   </div>
// </div>
