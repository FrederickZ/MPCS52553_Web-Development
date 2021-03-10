from flask import Flask, render_template, request, jsonify
import mysql.connector
import bcrypt
import random
import string
import sys
from datetime import datetime

DB_NAME = 'yumingz'
DB_USERNAME = 'root'
DB_PASSWORD = 'root'

PEPPER = 'Welcome to Belay!'
TOKEN_LENGTH = 16

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# test database connection
try:
    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    print("Successfully connected to database.")
    conn.close()
except Exception as e:
    sys.exit('Fail to connect mysql server. Error ' + str(e))

def generate_token():
    return ''.join(random.choices(string.ascii_lowercase+string.digits, k=TOKEN_LENGTH))

# -------------------------------- WEB ROUTES ---------------------------------

@app.route('/')
# @app.route('/channel/<channel_name>')
def index(chat_id=None, magic_key=None):
    return app.send_static_file('index.html')

# -------------------------------- API ROUTES ---------------------------------

@app.route('/api/register/login', methods=['POST'])
def login():
    body = request.get_json()
    email = body['email']
    password = body['password']

    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur= conn.cursor()
    query = """
    SELECT username, password FROM user WHERE email=%s
    """

    try:
        cur.execute(query, (email,))
        try:
            username, encrypted_password = cur.fetchone()
        except Exception as e:
            return {"error": "User not found."}, 404
        if bcrypt.checkpw((password+PEPPER).encode('utf-8'), encrypted_password.encode('utf-8')):
            return { "username": username }
        return {"error": "Password not matched."}, 404
    except Exception as e:
        return {"error": e.msg}, 404
    finally:
        cur.close()
        conn.close()


@app.route('/api/register/signup', methods=['POST'])
def signup():
    body = request.get_json()
    email = body['email']
    username = body['username']
    password = body['password'] + PEPPER
    encrypted_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()

    query = "INSERT INTO user VALUES (%s, %s, %s)"
    
    try:
        cur.execute(query, (username, email, encrypted_password))
        conn.commit()
        return {"username": username}
    except Exception as e:
        return {"error": e.msg}, 404
    finally:
        cur.close()
        conn.close()

@app.route('/api/channel', methods=['GET'])
def get_channel():
    user = request.args.get("user")

    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()
    

    try:
        if user == None:
            query = """
            SELECT channel, number, host, create_at FROM
                (SELECT channel, COUNT(*) AS number FROM session
                GROUP BY channel) AS channel 
                JOIN
                (SELECT channel, user AS host, create_at FROM session
                WHERE is_host = true) AS session_host 
                USING (channel)
            ORDER BY number ASC, create_at ASC
            """
            cur.execute(query)
            channels = []
            for channel in cur.fetchall():
                name, number, host, create_at = channel
                channels.append({
                    'channel': name, 
                    'number': number, 
                    'host': host,
                    'createAt': create_at
                })
            return {"channels": channels}
        else:  # user != None
            query = """
            SELECT channel, token, is_host, create_at, last_active FROM session
            WHERE user = %s
            """
            cur.execute(query, (user, ))
            channels = []
            for channel in cur.fetchall():
                channel, token, is_host, create_at, last_active = channel
                channels.append({
                    'channel': channel,
                    'token': token,
                    'isHost': is_host, 
                    'createAt': create_at,
                    'lastActive': last_active
                })
            return {"channels": channels}
    except Exception as e:
        print(e)
        return {"error": e.msg}, 302
    finally:
        cur.close()
        conn.close()

@app.route('/api/channel/create', methods=['POST'])
def create_channel():
    body = request.get_json()
    user = body["user"]
    channel = body["channel"]
    token = generate_token()

    if user == None or channel == None:
        return {}, 302

    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()
    query = """
    INSERT INTO session (token, channel, user, is_host) VALUES 
    (%s, %s, %s, %s)
    """

    try:
        cur.execute(query, (token, channel, user, True))
        conn.commit()
        print("success")
        return {
            'channel': channel,
            'token': token,
            'isHost': True, 
            'createAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'lastActive': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    except Exception as e:
        print(e)
        return {}, 302
    finally:
        cur.close()
        conn.close()

@app.route('/api/session/create', methods=['POST'])
def create_session():
    body = request.get_json()
    user = body["user"]
    channel = body["channel"]
    token = generate_token()
    
    if user == None or channel == None:
        return {}, 302

    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()
    query = "INSERT INTO session (token, channel, user) VALUES (%s, %s, %s)"
    try:
        cur.execute(query, (token, channel, user))
        conn.commit()
        print("success")
        return {
            'channel': channel,
            'token': token,
            'isHost': False, 
            'createAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'lastActive': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    except Exception as e:
        print(e)
        return {}, 302
    finally:
        cur.close()
        conn.close()


# @app.route('/api/message', methods=['GET'])
# def get_message():
#     channel_id = request.args.get("channel_id", type=int)
#     message_id = request.args.get("message_id", type=int)

#     if channel_id == None:
#         return {}, 302

#     conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
#     cur = conn.cursor()

#     try:
#         if message_id == None:
#             query = """
#             SELECT id, user, content, reply, create_at FROM message 
#             WHERE channel = %s
#             """
#             cur.execute(query, (channel_id, ))
#             messages = []
#             replies = {}
#             for message in cur.fetchall():
#                 msg_id, user, content, reply, create_at = message
#                 if reply == None:
#                     messages.append({
#                         'msgId': msg_id,
#                         'user': user,
#                         'content': content,
#                         'createAt': create_at
#                     })
#                 else:  # reply != None
#                     if replies.get(reply) == None:
#                         replies[reply] = []
#                     replies[reply].append({
#                         'msgId': msg_id,
#                         'user': user,
#                         'content': content,
#                         'createAt': create_at
#                     })
#             return {"messages": messages, 'replies': replies}
#         else:  # message_id != None
#             pass
#     except Exception as e:
#         return {"error": e.msg}, 302
#     finally:
#         cur.close()
#         conn.close()

# @app.route('/api/message/post', methods=['POST'])
# def post_message():
#     pass


# @app.route('/api/message/reply', methods=['POST'])
# def reply_message():
#     pass