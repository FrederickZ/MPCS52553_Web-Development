const MSG_ROLLING_INTERVAL = 500

function createGetRequest(api) {
  return fetch(api, {
    method: 'GET',
    headers: new Headers({
      "content-type": "application/json"
    })
  })
}

function createPostRequest(api, strJSON) {
  return fetch(api, {
    method: 'POST',
    body: strJSON,
    headers: new Headers({
      "content-type": "application/json"
    })
  })
}

function showUsernameErr() {
  if (document.getElementById("username-error").textContent == ""){
    let usernameErrMsg = document.createTextNode("Please create your username.");
    document.getElementById("username-error").appendChild(usernameErrMsg);
  }
}

function createChat() {
  let username = document.getElementById("username").value;
  if (username == "") {
    showUsernameErr()
    return;
  }

  let api = '/api/create';
  let body = JSON.stringify({ host: username });
  let request = createPostRequest(api, body)

  request.then(function(response) {
    response.json().then(function(data) {
      console.log(data);
      window.location.replace(`/chat/${data.chat_id}?session_token=${data.session_token}`);
    })
  })
}

/* For auth.html */
function authenticate() {
  const urlParams = new URLSearchParams(window.location.search);
  let chatId = parseInt(urlParams.get('chat_id'))
  let magicKey = urlParams.get('magic_key')
  let username = document.getElementById("username").value;

  if (username == "") {
    showUsernameErr()
    return;
  }

  let api = `/api/authenticate?chat_id=${chatId}&magic_key=${magicKey}`;
  let body = JSON.stringify({
    chat_id: chatId,
    magic_key: magicKey,
    user: username,
  });
  let request = createPostRequest(api, body)

  request.then(function(response) {
    response.json().then(function(data) {
      console.log(data.success)
      if (data.success == true) {
        window.location.replace(`/chat/${chatId}?session_token=${data.session_token}`);
      } else {
        window.location.replace('/');
      }
    })
  })
}

/* For chat.html */
function postMessage() {
  let chatId = parseInt(window.location.pathname.substr(6))
  const urlSearchParams = new URLSearchParams(window.location.search);
  let sessionToken = urlSearchParams.get('session_token');
  let chat = document.getElementById("chat");
  let chatBody = chat.value
  if (chatBody == "") { return; }

  let api = `/api/messages?chat_id=${chatId}&session_token=${sessionToken}`;
  let body = JSON.stringify({
    chat_id: chatId,
    session_token: sessionToken,
    message_body: chatBody,
  });
  let request = createPostRequest(api, body)

  request.then(function(response) {
    response.json().then(function(data) {
      chat.value = ''
    })
  })
}

function showMessages(chatId, data, preData) {
  if (data.length != 0 && (data.length != preData.length || data[0].timestamp != preData[0].timestamp)) {
    const messagesBox = document.getElementById("messages-box");
    messagesBox.innerHTML = '';
    for (i = 0; i < data.length; i++) {
      let message = data[i]
      let messageBlock = document.createElement('div');
      messageBlock.className = 'message'
      messageBlock.id = `chat${chatId}-msg${i}`

      let msgTitleBlock = document.createElement('p');
      msgTitleBlock.className = 'title'
      let usernameSpan = document.createElement('span');
      usernameSpan.className = 'username'
      usernameText = document.createTextNode(message.username)
      usernameSpan.appendChild(usernameText)
      let timestampSpan = document.createElement('span');
      timestampSpan.className = 'timestamp'
      timestampText = document.createTextNode(message.timestamp.substr(11))
      timestampSpan.appendChild(timestampText)
      msgTitleBlock.appendChild(usernameSpan)
      msgTitleBlock.appendChild(timestampSpan)
      
      let msgBodyBlock = document.createElement('p');
      msgBodyBlock.className = 'body'
      let msgBodyText = document.createTextNode(message.body)
      msgBodyBlock.appendChild(msgBodyText)
      
      messageBlock.appendChild(msgTitleBlock)
      messageBlock.appendChild(msgBodyBlock)

      messagesBox.append(messageBlock)
    }
    window.scrollTo(0,document.body.scrollHeight);
  }
}

function startMessagePolling() {
  let chatId = parseInt(window.location.pathname.substr(6))
  const urlSearchParams = new URLSearchParams(window.location.search)
  let sessionToken = urlSearchParams.get('session_token');
  let api = `/api/messages?chat_id=${chatId}&session_token=${sessionToken}`;
  let preMessages = [];
  setInterval(function() {
    let request = createGetRequest(api)
    request.then(function(response) {
      response.json().then(function(data) {
        messages = data.messages;
        showMessages(chatId, messages, preMessages);
        preMessages = messages;
      })
    })
  }, MSG_ROLLING_INTERVAL)
}

function getMagicLink() {
  let chatId = parseInt(window.location.pathname.substr(6))
  const urlSearchParams = new URLSearchParams(window.location.search)
  let sessionToken = urlSearchParams.get('session_token');
  let api = `/api/link?chat_id=${chatId}&session_token=${sessionToken}`;
  let request = createGetRequest(api)
  request.then(function(response) {
    response.json().then(function(data) {
      window.alert(data.magic_link)
    })
  })
}

function getUserChats() {
  let chatId = parseInt(window.location.pathname.substr(6))
  const urlSearchParams = new URLSearchParams(window.location.search)
  let sessionToken = urlSearchParams.get('session_token');
  let api = `/api/chats?chat_id=${chatId}&session_token=${sessionToken}`;
  let request = createGetRequest(api)
  request.then(function(response) {
    response.json().then(function(data) {
      console.log(data)
      const userChats = data.chats
      const chatsUl = document.getElementById("user-chats")
      for (i = 0; i < userChats.length; i++) {
        let userChat = userChats[i]
        let userChatId = userChat.chat_id
        let userSessionToken = userChat.session_token
        let chatLi = document.createElement('li')
        chatLi.innerHTML = `<a href="/chat/${userChatId}?session_token=${userSessionToken}">${userChatId}</a>`
        if (userChatId == chatId) {
          chatLi.setAttribute("style", "background: rgb(128, 0, 128)");
        }
        chatsUl.append(chatLi)
        
      }
    })
  })
} 
