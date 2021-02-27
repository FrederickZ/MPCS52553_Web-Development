const navColumn = document.getElementById('channels-nav');
const homeColumn = document.getElementById('home');
const chatColumn = document.getElementById('chat')
const threadsColumn = document.getElementById('threads');

function navToChannelsList() {
    chatColumn.style.display = "none";
    threadsColumn.style.display = "none";
    homeColumn.style.display = "block";
}

