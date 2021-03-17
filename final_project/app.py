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
    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()
    query = """
    SELECT channel, members, host, create_at FROM
        (SELECT channel, COUNT(*) AS members FROM session
        GROUP BY channel) AS channel 
        JOIN
        (SELECT channel, user AS host, create_at FROM session
        WHERE is_host = true) AS session_host 
        USING (channel)
    ORDER BY members ASC, create_at ASC
    """

    try:
        cur.execute(query)
        channels = []
        for channel in cur.fetchall():
            name, members, host, create_at = channel
            channels.append({
                'name': name, 
                'members': members, 
                'host': host,
                'createAt': create_at
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
    channel = body["name"]
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
        query = """
        SELECT create_at, last_active FROM session 
        WHERE token = %s
        """
        cur.execute(query, (token, ))
        create_at, last_active = cur.fetchone()

        return {
            "session": {
                channel: {
                    'token': token,
                    'isHost': True, 
                    'createAt': create_at,
                    'lastActive': last_active
                }
            }
        }
    except Exception as e:
        print(e)
        return {}, 302
    finally:
        cur.close()
        conn.close()

@app.route('/api/session', methods=['GET'])
def get_session():
    user = request.args.get("user")
    if user == None:
        return {}, 302

    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()
    query = """
    SELECT token, channel, is_host, create_at, last_active FROM session
    WHERE user = %s
    """

    try:
        cur.execute(query, (user, ))
        sessions = {}
        for session in cur.fetchall():
            token, channel, is_host, create_at, last_active = session
            sessions[channel] = {
                'token': token,
                'isHost': is_host, 
                'createAt': create_at,
                'lastActive': last_active
            }
        return {"sessions": sessions}
    except Exception as e:
        print(e)
        return {"error": e.msg}, 302
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
    query = """
    INSERT INTO session (token, channel, user) VALUES (%s, %s, %s)
    """
    try:
        cur.execute(query, (token, channel, user))
        conn.commit()
        query = """
        SELECT create_at, last_active FROM session 
        WHERE token = %s
        """
        cur.execute(query, (token, ))
        create_at, last_active = cur.fetchone()

        return {
            "session": {
                channel: {
                    'token': token,
                    'isHost': True, 
                    'createAt': create_at,
                    'lastActive': last_active
                }
            }
        }
    except Exception as e:
        print(e)
        return {}, 302
    finally:
        cur.close()
        conn.close()

@app.route('/api/session/update', methods=['POST'])
def update_session():
    body = request.get_json()
    token = body["token"]
    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()
    query = """
    UPDATE session SET last_active = NOW() WHERE token = %s
    """
    try:
        cur.execute(query, (token, ))
        conn.commit()
        query = """
        SELECT last_active FROM session WHERE token = %s
        """
        cur.execute(query, (token, ))
        last_active = cur.fetchone()[0]
        return {
            'lastActive': last_active
        }
    except Exception as e:
        print(e)
        return {}, 302
    finally:
        cur.close()
        conn.close()

def get_user_by_channel(token, channel):
    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()
    query = """
    SELECT token, user FROM session WHERE channel = %s
    """
    try:
        cur.execute(query, (channel, ))
        for session in cur.fetchall():
            if token == session[0]:
                return session[1]
        return None
    except Exception as e:
        print(e)
        return None
    finally:
        cur.close()
        conn.close()

@app.route('/api/message/new', methods=['POST'])
def new_message():
    channel = request.args.get("channel")
    token = request.args.get("token")
    body = request.get_json()
    user, content = tuple(body.values());
    token_user = get_user_by_channel(token, channel)
    if token_user == None or token_user != user:
        return {}, 302

    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()
    query = """
    INSERT INTO message (channel, user, content) VALUES (%s, %s, %s)
    """
    try:
        cur.execute(query, (channel, user, content))
        conn.commit()
        return {}
    except Exception as e:
        print(e)
        return {}, 302
    finally:
        cur.close()
        conn.close()

@app.route('/api/message/reply', methods=['POST'])
def reply_message():
    channel = request.args.get("channel")
    message = request.args.get("message")
    token = request.args.get("token")
    body = request.get_json()
    user, content = tuple(body.values());
    token_user = get_user_by_channel(token, channel)
    if token_user == None or token_user != user:
        return {}, 302

    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()
    query = """
    INSERT INTO message (channel, user, content, reply) VALUES (%s, %s, %s, %s)
    """
    try:
        cur.execute(query, (channel, user, content, message))
        conn.commit()
        return {}
    except Exception as e:
        print(e)
        return {}, 302
    finally:
        cur.close()
        conn.close()

@app.route('/api/message', methods=['GET'])
def get_message():
    channel = request.args.get("channel")
    token = request.args.get("token")
    if channel == None or token == None:
        return {}, 302
    user = get_user_by_channel(token, channel)
    if user == None:
        return {}, 302

    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()
    query = """
    SELECT id, user, content, reply, time FROM message WHERE channel = %s
    """

    try:
        cur.execute(query, (channel, ))
        messages = []
        replies = {}
        for message in cur.fetchall():
            id, user, content, reply, time = message
            if reply == 0:
                messages.append({
                    'id': id,
                    'user': user,
                    'content': content,
                    'time': time
                })
            else:  # reply != 0
                if replies.get(reply) == None:
                    replies[reply] = []
                replies[reply].append({
                    'id': id,
                    'user': user,
                    'content': content,
                    'time': time
                })
        print({"messages": messages, 'replies': replies})
        return {"messages": messages, 'replies': replies}
    except Exception as e:
        print(e)
        return {}, 302
    finally:
        cur.close()
        conn.close()

def get_user_by_token(token):
    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()
    query = """
    SELECT user FROM session WHERE token = %s
    """
    try:
        cur.execute(query, (token, ))
        result = cur.fetchone()
        if (result):
            return result[0]
        else:
            return None
    except Exception as e:
        print(e)
        return None
    finally:
        cur.close()
        conn.close()

@app.route('/api/message/unreads', methods=['GET'])
def get_unread_message():
    user = request.args.get("user")
    token = request.args.get("token")
    if user == None or token == None:
        return {}, 302
    user = get_user_by_token(token)
    if user == None:
        return {}, 302

    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()
    query = """
    SELECT id, m.channel, content, reply, time FROM message AS m
    JOIN session AS s ON (m.channel = s.channel AND m.user = s.user) 
    WHERE (m.user = %s AND m.time >= s.last_active)
    """

    try:
        cur.execute(query, (user, ))
        unreads = {}
        for message in cur.fetchall():
            id, channel, content, reply, time = message
            if unreads.get(channel) == None:
                unreads[channel] = {
                    'messages': [],
                    'replies': {}
                }
            if reply == 0:
                unreads[channel]['messages'].append({
                    'id': id,
                    'user': user,
                    'content': content,
                    'time': time
                })
            else:  # reply != 0
                if unreads[channel]['replies'].get(reply) == None:
                    unreads[channel]['replies'][reply] = []
                unreads[channel]['replies'][reply].append({
                    'id': id,
                    'user': user,
                    'content': content,
                    'time': time
                })
        print(unreads)
        return {"unreads": unreads}
    except Exception as e:
        print(e)
        return {}, 302
    finally:
        cur.close()
        conn.close()
