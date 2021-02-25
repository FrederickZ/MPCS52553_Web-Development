from flask import Flask, render_template, request
import mysql.connector
import sys

DB_NAME = 'yumingz'
DB_USERNAME = None
DB_PASSWORD = None
PEPPER = 'Welcome to Watch Party2!'

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# connection test
try:
    conn = mysql.connector.connect()
    conn.close()
except Exception as e:
    sys.exit('Fail to connect mysql server. Error ' + str(e))

# -------------------------------- WEB ROUTES ----------------------------------

@app.route('/')
@app.route('/channel/<channel_name>')
def index(chat_id=None, magic_key=None):
    return app.send_static_file('index.html')

