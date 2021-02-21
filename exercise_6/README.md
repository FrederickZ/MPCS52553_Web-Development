# Exercise #6: Watch Party 2: The Single Page Experience

5 points

**DUE: Wednesday, February 24 by 1:50pm**

### Instructions

For this exercise, we will build a *single-page* group chat web application with
asynchronous Javascript and a REST API written in Python with Flask.

Like the original, Watch Party 2 lets users start group chats with
disappearing messages, and invite up to five friends. This time, however, we
serve a static HTML page and never redirect or reload. Instead, the page
interacts purely with the JSON API.

As before, chats may contain up to 6 users and up to 30 messages. This time,
however, we prompt users for a username and password when they create a chat or
join one, and we remember which chats users are in. We store user passwords
securely in a database with bcrypt, salt, and pepper. (The rest of the
application's data can be stored in memory, as before).

The default page should allow users to create a new chat, prompting them for a
username when they do. Create a new chat by `POST`ing to the JSON API. The
response will contain a session_token, chat_id, and a magic invite link. Save
the session_token to local storage. Without reloading, display the chat screen
and push `chat/<chat_id>` to the URL bar and browser history. Display the invite
link on the page.

When a user visits the invite link, serve them the same single-page application.
The application should use the URL query parameters to try to authenticate via
the API. If successful (i.e. the invite link is valid and the room isn't full),
prompt them for a username and then show them the chat screen and set the URL
bar and browser history to `chat/<chat_id>`. Otherwise, show them the default
page and set the URL bar and browser history to `/`.

Users in the chat post messages using the API, and the front-end continuously
polls the API for new messages, so that they appear automatically in the chat.
Store the usernames on the server associated with the session_tokens, so users
do not have to supply them on each message.

Starting with the files included in this directory, implement the UI for Watch
Party in HTML, CSS, and Javascript, and serve it using server-side code written
in the [latest stable version of Python](https://www.python.org/downloads/release/python-381/)
([3.8.1](https://www.python.org/downloads/release/python-381/))
and [Flask]((https://www.python.org/downloads/release/python-381/)). You'll
notice that there are some routes in `app.py` to get you started:
- Prompt users to enter a username and password to sign up or log in
- Display a list of chats a logged in user is currently in, with a button to
  create a new one.
- Give each chat a unique URL so users can return to it if they close their
  tab or reload the page. Remember who they are if they do.
- Allow users to be in multiple chats in multiple tabs if they want.
- As other users type new messages in a chat, Watch Party should asynchronously
  fetch them, and those messages should appear automatically without anyone
  reloading or otherwise interacting with the page.

Watch Party can be visually very simple, but should render responsively on
desktops and on mobile. Make sure the message input for for a chat is always on
the screen regardless of where the user scrolls. Chats are intended to be
ephemeral and are not saved to a database or the filesystem (ie it's ok for them
just to exist in memory on the web server). For the purposes of this Exercise,
you do not need to worry about garbage collecting chats that are not in use.

Remember to include in your submission any classmates you collaborated with and
any materials you consulted. Watch Party (though it has somewhat different
requirements) is inspired by [yap.chat](https://yap.chat/).

### Rubric

One point each for:
- Single-Page UI: Have only one HTML file, containing the elements to display either the login screen, a list of chats the user is in, or the screen for a single chat (list messages sent, display the magic invite link, fields to enter a new message), and showing or hiding the elements as appropriate, without reloading the page.
- State from Navigation Bar: To navigate in-app without reloading the page, pull the chat_id and magic link magic_key from the URL navigation bar as needed and use them to determine which single-page elements to display.
- Push Single-Page State to the Navigation Bar: Use `history.pushState` to set which chat the user has navigated to, and to clear the magic link magic_key from the navigation bar after it has been used.
- Asyncronously Post and Fetch New Messages: Use asynchronous calls to the JSON API to post and fetch new messages. Continuously poll for new messages from other users and display them as they are written.
- Password Authentication: Store usernames and passwords in a MySQL or MariaDB
database.
