const firebaseConfig = {
      apiKey: "AIzaSyDDvZxoPp8r1V6skgZQGrjwSs04ultG-9A",
      authDomain: "radioweb-e6cbf.firebaseapp.com",
      databaseURL: "https://radioweb-e6cbf-default-rtdb.firebaseio.com",
      projectId: "radioweb-e6cbf",
      storageBucket: "radioweb-e6cbf.firebasestorage.app",
      messagingSenderId: "977133617782",
      appId: "1:977133617782:web:5a7492ff67eff9255bd557"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    const radio = document.getElementById('radio');
    const volumeControl = document.getElementById('volume');
    const chatBox = document.getElementById('chatBox');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatHeader = document.querySelector('.chat-header');

    let userNickname = localStorage.getItem('nickname') || '';
    let userAvatar = localStorage.getItem('avatar') || '';

    volumeControl.addEventListener('input', () => radio.volume = volumeControl.value);

    function toggleChat() {
      if (!userNickname) {
        document.getElementById('userModal').style.display = 'flex';
      } else {
        chatBox.style.display = chatBox.style.display === 'flex' ? 'none' : 'flex';
      }
    }

    function saveUserInfo() {
      const name = document.getElementById('nickname').value.trim();
      const fileInput = document.getElementById('avatarFile');
      if (!name) return alert('Digite um nome.');
      userNickname = name;
      localStorage.setItem('nickname', userNickname);

      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          userAvatar = e.target.result;
          localStorage.setItem('avatar', userAvatar);
          finishLogin();
        };
        reader.readAsDataURL(file);
      } else {
        userAvatar = '';
        localStorage.setItem('avatar', '');
        finishLogin();
      }
    }

    function finishLogin() {
      document.getElementById('userModal').style.display = 'none';
      chatBox.style.display = 'flex';
    }

    function sendMessage() {
      const message = chatInput.value.trim();
      if (!message) return;
      const msgObj = {
        nickname: userNickname,
        avatar: userAvatar,
        text: message,
        timestamp: Date.now()
      };
      db.ref('chat').push(msgObj);
      chatInput.value = '';
    }

    function insertEmoji(emoji) {
      chatInput.value += emoji;
      chatInput.focus();
    }

    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    db.ref('chat').limitToLast(50).on('child_added', function (snapshot) {
      const data = snapshot.val();
      const div = document.createElement('div');
      div.classList.add('chat-message');

      const img = document.createElement('img');
      img.src = data.avatar || 'https://via.placeholder.com/32?text=👤';
      div.appendChild(img);

      const content = document.createElement('div');
      content.classList.add('chat-message-content');
      content.innerHTML = `<strong>${data.nickname}</strong><br>${data.text}`;
      div.appendChild(content);

      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    const listenersRef = db.ref('listeners');
    const listenerId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const listenerRef = listenersRef.child(listenerId);
    listenerRef.set({ online: true });
    listenerRef.onDisconnect().remove();

    listenersRef.on('value', snapshot => {
      const total = snapshot.numChildren();
      chatHeader.innerText = `Chat dos Ouvintes (🔊 ${total} ouvindo agora)`;
    });

    // --- Código para arrastar o chat flutuante
    let isDragging = false;
    let offsetX, offsetY;

    const dragBox = chatBox;
    const dragHeader = document.querySelector('.chat-header');

    dragHeader.addEventListener('mousedown', function (e) {
      isDragging = true;
      const rect = dragBox.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      dragBox.style.transition = 'none';
    });

    document.addEventListener('mousemove', function (e) {
      if (isDragging) {
        dragBox.style.left = (e.clientX - offsetX) + 'px';
        dragBox.style.top = (e.clientY - offsetY) + 'px';
        dragBox.style.right = 'auto';
        dragBox.style.bottom = 'auto';
        dragBox.style.position = 'fixed';
      }
    });

    document.addEventListener('mouseup', function () {
      isDragging = false;
    });