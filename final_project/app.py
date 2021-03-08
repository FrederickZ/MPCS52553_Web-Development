from flask import Flask, render_template, request
import mysql.connector
import bcrypt
import sys

DB_NAME = 'yumingz'
DB_USERNAME = 'root'
DB_PASSWORD = 'root'
PEPPER = 'Welcome to Belay!'

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# test database connection
try:
    conn = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    print("Successfully connected to database.")
    conn.close()
except Exception as e:
    sys.exit('Fail to connect mysql server. Error ' + str(e))

# -------------------------------- WEB ROUTES ---------------------------------

@app.route('/')
@app.route('/channel/<channel_name>')
def index(chat_id=None, magic_key=None):
    return app.send_static_file('index.html')




# -------------------------------- API ROUTES ---------------------------------

@app.route('/api/register/login', methods=['POST'])
def login():
    body = request.get_json()
    print(body)

    email = body['email']
    password = body['password']

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()

    query = "SELECT username, password FROM user WHERE email=%s"

    try:
        cursor.execute(query, (email,))
        username, encrypted_password = cursor.fetchone()
        if bcrypt.checkpw((password+PEPPER).encode('utf-8'), encrypted_password.encode('utf-8')):
            print("success")
            return {"username": username}
        return {}, 404
    except Exception as e:
        print(e)
        return {}, 404
    finally:
        cursor.close()
        connection.close()


@app.route('/api/register/signup', methods=['POST'])
def signup():
    body = request.get_json()
    email = body['email']
    username = body['username']
    password = body['password'] + PEPPER
    encrypted_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()

    query = "INSERT into user (email, username, password) VALUES (%s, %s, %s)"
    
    try:
        cursor.execute(query, (email, username, encrypted_password))
        connection.commit()
        print("success")
        return {"username": username}
    except Exception as e:
        print(e)
        return {"username": username}, 302
    finally:
        cursor.close()
        connection.close()