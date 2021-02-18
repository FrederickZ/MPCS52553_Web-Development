import string
import json
import random
from threading import Thread
from datetime import datetime, timedelta
from flask import Flask, request, redirect
from functools import wraps

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

ROOM_CAPACITY = 6
TOKEN_LENGTH = 8
KEY_LENGTH = 16
chats = {}
tokens = []

# token_monitor = Thread(target=monitoring_tokens, daemon=True)
# token_monitor.start()

def newChat(host, session_token):
    authorized_users = dict([
        (session_token, dict([
            ("username", host),
            ("expires", get_str_expires())
        ]))
    ])
    magic_key = gen_key()

    return dict([
        ("authorized_users", authorized_users),
        ("magic_key", magic_key),
        ("messages", [])
    ])

# def monitoring_tokens():
#     global tokens
#     while True:
#         if len(tokens) > 0 and tokens[0]

def is_valid_auth(request):
    chat_id = request.args.get("chat_id", type=int)
    magic_key = request.args.get("magic_key")
    return (chat_id != None and magic_key != None and 
                chats.get(chat_id) != None and
                magic_key == chats[chat_id]["magic_key"])

def is_valid_session(chat_id, request):
    session_token = request.args.get("session_token")
    return (session_token != None and chats.get(chat_id) != None and
                session_token in chats[chat_id]["authorized_users"].keys())

def get_str_expires():
    expires = datetime.utcnow() + timedelta(hours=6)
    return expires.isoformat(timespec='seconds') + 'Z'

def get_str_timestamp():
    return datetime.utcnow().isoformat(timespec='seconds') + 'Z'

def gen_key():
    return ''.join(random.choices(string.ascii_lowercase+string.digits, 
                                    k=KEY_LENGTH))

def gen_token():
    return ''.join(random.choices(string.ascii_lowercase+string.digits, 
                                    k=TOKEN_LENGTH))



# -------------------------------- WEB ROUTES ----------------------------------

@app.route('/')
def index(chat_id=None):
    return app.send_static_file('index.html')

@app.route('/auth')
def auth():
    if is_valid_auth(request):
        return app.send_static_file('auth.html')
    return "Invalid magic invite link."

@app.route('/chat/<int:chat_id>')
def chat(chat_id):
    if (chat_id != None and is_valid_session(chat_id, request)):
        return app.send_static_file('chat.html')
    return redirect('/')
    


# -------------------------------- API ROUTES ----------------------------------

@app.route('/api/create', methods=['POST'])
def create():
    req = request.get_json()
    token = gen_token()
    chat = newChat(req['host'], token)
    chat_id = 1
    while True:
        if (chats.get(chat_id) == None or 
                len(chats[chat_id]['authorized_users']) == 0):
            break
        chat_id += 1
    chats[chat_id] = chat
    return {
        "chat_id": chat_id,
        "session_token": token,
        "magic_invite_link": 
            "http://localhost:5000/auth?chat_id={}&magic_key={}"
            .format(chat_id, chat['magic_key'])
    }

@app.route('/api/authenticate', methods=['POST'])
def authenticate():
    if not is_valid_auth(request):
        return {
            "success": False,
            "message": "Invalid magic invite link.",
            "token": None
        }

    req = request.get_json()
    chat_id = req['chat_id']
    username = req['user']
    users = chats[chat_id]['authorized_users']
    print(users)
    for session_token, info in users.items():
        if info['username'] == username:
            info['expires'] = get_str_expires()
            return {
                "success": True,
                "message": "User already authenticated.",
                "session_token": session_token
            }
    if len(users) == ROOM_CAPACITY:
        return {
            "success": False,
            "message": "Max room capacity reached.",
            "session_token": None
        }

    new_session_token = gen_token()
    users[new_session_token] = {
        "username": username,
        "expires": get_str_expires()
    }
    return {
        "success": True,
        "message": "User authenticated; session token generated.",
        "session_token": new_session_token
    }

@app.route('/api/chat', methods=['GET'])
def get_chat():
    chat_id = request.args.get("chat_id", type=int)
    is_valid_request = (chat_id != None and chats.get(chat_id) != None and 
                            is_valid_session(chat_id, request))

    if not is_valid_request:
        return {
            "success": False,
            "chat_id": None,
            "chat": None
        }
    return {
        "success": True,
        "chat_id": chat_id,
        "chat_info": chats[chat_id]
    }

@app.route('/api/link', methods=['GET'])
def get_link():
    chat_id = request.args.get("chat_id", type=int)
    is_valid_request = (chat_id != None and chats.get(chat_id) != None and 
                            is_valid_session(chat_id, request))

    if not is_valid_request:
        return {
            "success": False,
            "magic_link": None,
        }
    
    magic_key = chats[chat_id]['magic_key']
    magic_link = ("http://localhost:5000/auth?chat_id={}&magic_key={}"
                    .format(chat_id, magic_key))
    return {
        "success": True,
        "magic_link": magic_link,
    }

@app.route('/api/chats', methods=['GET'])
def get_chats():
    chat_id = request.args.get("chat_id", type=int)
    session_token = request.args.get("session_token")
    username = ""
    is_valid = True
    if chat_id != None:
        if is_valid_session(chat_id, request):
            username = chats[chat_id]['authorized_users'][session_token]['username']
        else:
            is_valid = False
    else:
        for chat_id, chat in chats.items():
            if session_token in chat['authorized_users'].keys():
                username = chat['authorized_users'][session_token]['username']
                break;
        if username == "":
            is_valid = False
    if is_valid == False:
        return {
            "success": False,
            "username": None,
            "chats": None
        }
    user_chats = []
    for chat_id, chat in chats.items():
        for token, user in chat['authorized_users'].items():
            if username == user['username']:
                user_chats.append({
                    "chat_id": chat_id,
                    "session_token": token
                })
    return {
        "success": True,
        "username": username,
        "chats": user_chats,
    }

@app.route('/api/messages', methods=['GET'])
def get_messages():
    # TODO: check if the request body contains a chat_id and valid session token for that chat
    chat_id = request.args.get("chat_id", type=int)
    is_valid_request = (chat_id != None and chats.get(chat_id) != None and 
                            is_valid_session(chat_id, request))

    if not is_valid_request:
        return {
            "success": False,
            "chat_id": None,
            "messages": None,
        }
    return {
        "success": True,
        "chat_id": chat_id,
        "messages": chats[chat_id]['messages']
    }

@app.route('/api/messages', methods=['POST'])
def post_message():
    # TODO: check if the request body contains a chat_id and valid session token for that chat
    chat_id = request.args.get("chat_id", type=int)
    is_valid_request = (chat_id != None and chats.get(chat_id) != None and 
                            is_valid_session(chat_id, request))
    if not is_valid_request:
        return {
            'success': False,
            'message': "Invalid chat session."
        }

    req = request.get_json()
    timestamp = get_str_timestamp()
    chat_id = req['chat_id']
    session_token = req['session_token']
    message_body = req['message_body']
    chat = chats[chat_id]
    username = chat['authorized_users'][session_token]['username']
    messages = chat['messages']
    messages.append({
        "username": username,
        "body": message_body,
        "timestamp": timestamp
    })
    while (len(messages) > 30):
        messages.pop(0)

    return {
            'success': True,
            'message': "Message sent to chat room."
    }