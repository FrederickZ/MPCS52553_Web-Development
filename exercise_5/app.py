import string
import random
from datetime import datetime
from flask import Flask, render_template, request
from functools import wraps

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# sample_chats = {
#     1: {
#         "authorized_users": {
#             "session_token_0": {"username": "Alice", "expires": "2020-02-15T20:53:15Z"},
#             "session_token_1": {"username": "Bob", "expires": "2020-02-15T20:57:22Z"}
#         },
#         "magic_key": "some_really_long_key_value"
#         "messages": [
#             {"username": "Alice", "body": "Hi Bob!"},
#             {"username": "Bob", "body": "Hi Alice!"},
#             {"username": "Alice", "body": "Knock knock"},
#             {"username": "Bob", "body": "Who's there?"},
#         ]
#     }
# }
chats = {}

def newChat(host, session_token):
    authorized_users = dict([
        (session_token, dict([
            ("username", host),
            ("expires", datetime.utcnow() + timedelta(hours=6))
        ]))
    ])
    magic_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))

    return dict([
        ("authorized_users", authorized_users),
        ("magic_key", magic_key),
        ("messages", [])
    ])


@app.route('/')
def index(chat_id=None):
    return app.send_static_file('index.html')

@app.route('/auth')
def auth():
    return app.send_static_file('auth.html')

@app.route('/chat/<int:chat_id>')
def chat():
    return app.send_static_file('chat.html')


# -------------------------------- API ROUTES ----------------------------------

@app.route('/api/create', methods=['POST'])
def create ():
    # TODO: generate a session token for the user who created the chat
    # TODO: create a chat data structure in global memory

    return {
        "chat_id": 1,
        "session_token": "some_token_value",
        "magic_invite_link": "http://localhost:5000/auth?chat_id=1&magic_key=some_really_long_key_value"
    }

@app.route('/api/authenticate', methods=['POST'])
def authenticate():
    # TODO: check if the request body contains a chat_id and the correct magic_key for that chat
    # TODO: also send a username
    return {"session_token": "some_token_value"}

@app.route('/api/messages', methods=['GET', 'POST'])
def messages ():
    # TODO: check if the request body contains a chat_id and valid session token for that chat
    if request.method == 'POST':
        # TODO: add the message
        pass

    messages = {} # TODO: get the messages for this chat from global memory
    return {
        "messages": messages,
        "magic_invite_link": "http://localhost:5000/chat/1?magic_key=some_really_long_key_value"
    }
