// page loads

// if the navigation bar is just "/"
//   hide the chat block
//   show the splash screen block
//   return
//
// else if the navigtion bar contains a magic link
//   hide the splash screen block
//   show the chat block
//
//   if we already have a session_token for this chat in local storage:
//     take the magic_key out of the url
//     start polling for messages
//     return
//
//   else (we don't have a session_token for this chat in local storage):
//     use the authenticate endpoint to try to exchange the magic key for a session_token
//
//     if you get a token back
//       put it in local storage
//       take the magic_key out of the url
//       start polling for messages
//       return
//
//     else (you didn't get a valid token back)
//       hide the chat screen
//       change url to "/"
//       show the splash screen
//       return
//
// else if the navigtion bar contains "/chat/<chat_id>"
//   hide the splash screen block
//   show the chat block
//
//   if we have session_token for this chat in local storage:
//     start polling for messages
//     return
//
//   else (no session token)
//     hide the chat screen
//     change url to "/"
//     show the splash screen
//     return
