from flask import Flask, render_template, request
import mysql.connector
import bcrypt
import random
import string
import sys

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
@app.route('/channel/<channel_name>')
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

    query = "SELECT username, password FROM user WHERE email=%s"

    try:
        cur.execute(query, (email,))
        username, encrypted_password = cur.fetchone()
        if bcrypt.checkpw((password+PEPPER).encode('utf-8'), encrypted_password.encode('utf-8')):
            return {"username": username}
        return {}, 404
    except Exception as e:
        print(e)
        return {}, 404
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
        print(e)
        return {"username": username}, 302
    finally:
        cur.close()
        conn.close()

@app.route('/api/channel', methods=['GET'])
def get_channel():
    user_arg = request.args.get("user")
    id_arg = request.args.get("id", type=int)

    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()

    try:
        if user_arg == None and id_arg == None:
            cur.execute("SELECT * FROM channel")
            all_channels = []
            for channel in cur.fetchall():
                id, name, host = channel
                all_channels.append({'id': id, 'name': name, 'host': host})
            return {"channels": all_channels}
        elif user_arg != None and id_arg != None:
            pass
        elif user_arg != None:
            query = """
            SELECT channel, name, token, create_at 
            FROM channel JOIN session ON channel.id = session.channel
            WHERE user = %s
            """
            cur.execute(query, (user_arg, ))
            user_channels = []
            for channel in cur.fetchall():
                id, name, token, create_at = channel
                user_channels.append({
                    'id': id, 
                    'name': name, 
                    'token': token, 
                    'create_at': create_at
                })
            return {"channels": user_channels}
        else:  # channel_id != None
            pass
    except Exception as e:
        print(e)
        return {}, 302
    finally:
        cur.close()
        conn.close()

@app.route('/api/channel/create', methods=['POST'])
def create_channel():
    body = request.get_json()
    user = body["user"]
    name = body["name"]

    if user == None or name == None:
        return {}, 302

    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()
    query = "INSERT INTO channel (name, host) VALUES (%s, %s)"

    try:
        cur.execute(query, (name, user))
        conn.commit()
        print("success")
        return {
            "id": cur.lastrowid, 
            "name": name, 
            "host": user
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
    print(body)
    user = body["user"]
    channel_id = body["channel_id"]
    token = generate_token()
    
    if user == None or channel_id == None:
        return {}, 302

    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cur = conn.cursor()
    query = "INSERT INTO session (token, channel, user) VALUES (%s, %s, %s)"
    print("here")
    try:
        cur.execute(query, (token, channel_id, user))
        conn.commit()
        print("success")
        return {
            "id": channel_id,
            "token": token,
            "user": user
        }
    except Exception as e:
        print(e)
        
        return {}, 302
    finally:
        cur.close()
        conn.close()
