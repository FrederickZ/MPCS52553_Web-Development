/* ------------------------------------------------------------
                            Thread         
------------------------------------------------------------ */

function ReplyBlock(props) {    
    let id = 'r-' + props.reply.id;
    return (
        <div id={id} className="reply-block">
            <div className="reply-body">
                {props.reply.content}
            </div>
            <div className="reply-footer">
                <p>{props.reply.user}<span>{props.reply.time}</span></p>
            </div>
        </div>
    )
}



class RepliesBox extends React.Component {
    constructor(props) {
        super(props)
    }
    
    render() {
        return null;
    }
}



class Thread extends React.Component {
    constructor(props) {
        super(props)

        this.newReply = ''
        this.onInputChange = this.onInputChange.bind(this)
    }

    onInputChange(e) {
        this.newReply = e.target.value;
    }

    onSendReply() {
        let channel = this.props.channel
        let message = this.props.threadMessage
        let token = window.sessionStorage.token
        fetch(`/api/message/reply?channel=${channel}&message=${message}&token=${token}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user: this.props.username,
                content: this.newMessage
            })
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    document.getElementById('new-reply-content').value = ''
                    this.newReply = '';
                });
            } else {
                response.json().then((data) => {
                    alert(data.error);
                })
            }
        }).catch((response) =>{
            console.log(response);
        })
    }

    render() {
        return (
            <div className="popup">
                <div id="thread" className="popup-box">
                    <div id="thread-header">
                        <p>{props.message.user}<span>{props.message.time}</span></p>
                        {props.message.content}
                    </div>
                    <RepliesBox />
                    <div id="new-reply">
                        <input 
                            type="text" id="new-reply-content" name="new-reply-content" onChange={this.onInputChange}
                        />
                        <button id="new-message-button" onClick={this.onSendReply}>Send</button>
                    </div>
                </div>
            </div>
            
        )
    }
}




/* ------------------------------------------------------------
                            Channel         
------------------------------------------------------------ */

function MessageBlock(props) { 
    let id = 'm-' + props.message.id;
    return (
        <div id={id} className="message-block">
            <div className="message-footer">
                <p>{props.message.user}<span>{props.message.time}</span></p>
            </div>
            <div className="message-body">
                <button onClick={props.onClickReply}><i className="material-icons">forum</i></button>
                {props.message.content}
            </div>
            
        </div>
    );
}

class MessagesBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            replies: {}
        }
        this.poller = null;

        this.getMessages = this.getMessages.bind(this)
    }

    componentDidMount() {
        this.getMessages();
        this.poller = setInterval(()=> this.getMessages(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.poller);
        this.poller = null;
    }

    getMessages() {
        if (!this.props.channel || !window.sessionStorage.token) {
            return;
        }
        fetch(`/api/message?channel=${this.props.channel}&token=${window.sessionStorage.token}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    this.setState({
                        messages: data.messages,
                        replies: data.replies
                    });
                })
            } else {
                console.log(response.status);
            }
        }).catch((response) =>{
            console.log(response);
        })
    }

    render() {
        const messageBlocks = this.state.messages.map(item => 
            <MessageBlock 
                key={item.id}
                message={item}
                replies={this.state.replies[item.id]}
                onClickReply={this.props.handleEnterThread}
            />
        )
        return (
            <div id="messages-box">
                { messageBlocks }
            </div>
        )
    }
}

class Channel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            threadMessage: 0
        }

        this.newMessage = '';
        this.onInputChange = this.onInputChange.bind(this)
        this.onSendMessage = this.onSendMessage.bind(this)
        this.handleEnterThread = this.handleEnterThread.bind(this)
    }

    onInputChange(e) {
        this.newMessage = e.target.value;
    }

    onSendMessage() {
        fetch(`/api/message/new?channel=${this.props.channel}&token=${window.sessionStorage.token}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user: this.props.username,
                content: this.newMessage
            })
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    document.getElementById('new-message-content').value = ''
                    this.newMessage = '';
                });
            } else {
                response.json().then((data) => {
                    alert(data.error);
                })
            }
        }).catch((response) =>{
            console.log(response);
        })
    }

    handleEnterThread(e) {
        this.setState({thread: e.target.id})
    }

    render() {
        return (
            <div id="channel">
                {this.state.threadMessage != 0 && 
                    <Thread 
                        message={this.state.threadMessage}
                    />
                }
                <div id="channel-header">
                    <div id="channel-info"></div>
                    <h1>{this.props.channel}</h1>
                </div>
                <MessagesBox 
                    channel={this.props.channel}
                    handleEnterThread={this.handleEnterThread}
                />
                <div id="new-message">
                    <input 
                        type="text" name="new-message-content" onChange={this.onInputChange}
                    />
                    <button onClick={this.onSendMessage}>
                        <i className="material-icons">send</i>
                    </button>
                </div>
            </div>
        )
    }
}






/* ------------------------------------------------------------
                            Home                               
------------------------------------------------------------ */

function ChannelBlock(props) {
    let id = 'ch-' + props.name;
    return (
        <button id={id} onClick={props.onClickChannelBlock}>
            {props.name}
        </button>
    )
}

function ChannelBlocksBar(props) {
    const channelBlocks = props.allChannels.map(item => 
        <ChannelBlock 
            key={item.name}
            name={item.name}
            onClickChannelBlock={props.handleClickChannelBlock}
        />
    );
    return (
        <div id="channel-blocks-bar">{ channelBlocks }</div>
    )
}

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allChannels: []
        }

        this.getAllChannels = this.getAllChannels.bind(this)
    }

    componentDidMount() {
        this.getAllChannels();
    }

    getAllChannels() {
        fetch("/api/channel", {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    this.setState({allChannels: data.channels});
                })
            } else {
                console.log(response.status);
            }
        }).catch((response) =>{
            console.log(response);
        })
    }

    render() {
        return (
            <div id="home">
                <div id="home-header">
                    <input 
                        type="text" name="new-channel-name" placeholder="search or create ..." 
                        onChange={this.props.onInputChange}
                    />
                    <button id="create-channel-button" onClick={this.props.onCreateChannel}>
                        <i className="material-icons">add</i>
                    </button>
                </div>
                <ChannelBlocksBar 
                    allChannels={this.state.allChannels}
                    handleClickChannelBlock={this.props.handleCreateSession}
                />
                
            </div>
        )
    }
}



/* ------------------------------------------------------------
                        Screen Controller                               
------------------------------------------------------------ */

class Screen extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let screen;
        if (!this.props.sessionChannel) {
            screen = (
                <Home 
                    onInputChange={this.props.handleInputChange}
                    onCreateChannel={this.props.handleCreateChannel}
                    handleCreateSession={this.props.handleCreateSession}
                />
            );
        } else {
            screen = (
                <Channel 
                    username={this.props.username}
                    channel={this.props.sessionChannel} 
                />
            );
        }
        return (
            <div id="screen">{ screen }</div>
        );
    }
}



/* ------------------------------------------------------------
                        Nav                                
------------------------------------------------------------ */

class SessionTab extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let id = 'se-' + this.props.sessionChannel;
        let sessionButtonText = this.props.sessionChannel
        if (this.props.hasUnreads) {
            sessionButtonText = "! " + sessionButtonText
        }
        return (
                <button id={id} className="session-tab div-button" onClick={this.props.onClickSessionTab}>
                    {sessionButtonText}
                </button>
            
        );
    }
}

class SessionTabsBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const sessionTabs = Object.keys(this.props.userSessions).map(item => 
            <SessionTab 
                key={this.props.userSessions[item].token}
                sessionChannel={item}
                hasUnreads={this.props.unreads[item] ? true : false}
                onClickSessionTab={this.props.handleClickSessionTab}
            />
        );
        return (
            <div id="session-tabs-bar">
                {sessionTabs}
            </div>
        )
    }
    
}

function Profile(props) {
    return (
        <div id="profile">
            <p>{window.localStorage.username}</p>
            <button variant="light"><i className="material-icons">settings</i></button>
            <button variant="light" onClick={props.onClickLogout}><i className="material-icons">logout</i></button>
        </div>
    )
}

class Nav extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.getUserSessions();
    }

    render() {
        return (
            <div id="nav">
                <SessionTabsBar 
                    userSessions={this.props.userSessions}
                    handleClickSessionTab={this.props.handleSwitchSession}
                    unreads={this.props.unreads}
                />
                <button id="back-home" variant="light" onClick={this.props.onClickBackHome}>
                    <i className="material-icons">add</i>
                </button>
                <Profile
                    username={this.props.username}
                    onClickLogout={this.props.handleLogout}
                />
            </div>
        );
    }
}



/* ------------------------------------------------------------
                    Panel Controller                                
------------------------------------------------------------ */

class Panel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            sessionChannel: '',
            userSessions: {},
            unreads: {}
        }

        this.getUnreads = this.getUnreads.bind(this);

        this.getUserSessions = this.getUserSessions.bind(this);
        this.handleSwitchSession = this.handleSwitchSession.bind(this);

        this.handleBackHome = this.handleBackHome.bind(this);

        this.newChannelName = ''
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleCreateChannel = this.handleCreateChannel.bind(this);

        this.handleCreateSession = this.handleCreateSession.bind(this);
        this.handleUpdateSessionTimestamp = this.handleUpdateSessionTimestamp.bind(this);
    }

    componentDidMount() {
        this.poller = setInterval(()=> this.getUnreads(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.poller);
        this.poller = null;
    }

    getUnreads() {
        if (!this.props.username || !this.state.userSessions) {
            return;
        }
        let token = this.state.userSessions[Object.keys(this.state.userSessions)[0]].token
        fetch(`/api/message/unreads?user=${this.props.username}&token=${token}`, {
            method: "GET",
            headers: {'Content-Type': 'application/json'},
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    this.setState({
                        unreads: data.unreads
                    })
                })
            } else {
                console.log(response.status);
            }
        }).catch((response) => {
            console.log(response);
        })
    }

    handleBackHome() {
        window.sessionStorage.clear()
        this.setState({sessionChannel: ''})
    }
    handleSwitchSession(e) {
        let channel = e.target.id.substring(3);
        window.sessionStorage.setItem("token", this.state.userSessions[channel].token)
        this.setState({sessionChannel: channel});
        this.handleUpdateSessionTimestamp();
    }
    handleInputChange(e) {
        this.newChannelName = e.target.value;
    }
    handleCreateChannel() {
        const userSessions = JSON.parse(JSON.stringify(this.state.userSessions));
        let channelName = this.newChannelName;
        if (!channelName || !/^[a-z0-9]+(_[a-z0-9]+)*$/.test(channelName)) {
            alert(`Invalid channel name: ${channelName}\n1-40 characters; a-z 0-9 only; separator: _`);
            return;
        }

        fetch('/api/channel/create', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user: this.props.username, name: channelName})
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    let session = data.session;
                    let sessionChannel = Object.keys(session)[0];
                    window.sessionStorage.setItem("token", session.token);
                    userSessions[sessionChannel] = session[sessionChannel];
                    this.setState({
                        sessionChannel: sessionChannel,
                        userSessions: userSessions
                    })
                })
            } else {
                response.json().then((data) => {
                    alert(data.error);
                })
            }
        }).catch((response) =>{
            console.log(response);
        })
    }
    handleCreateSession(e) {
        const userSessions = JSON.parse(JSON.stringify(this.state.userSessions));
        let channel = e.target.id.substring(3);
        if (userSessions[channel]) {
            let session = userSessions[channel]
            window.sessionStorage.setItem("token", session.token);
            this.setState({
                sessionChannel: channel,
            })
            return;
        }

        fetch('/api/session/create', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user: this.props.username, channel: channel})
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    let session = data.session;
                    let sessionChannel = Object.keys(session)[0];
                    window.sessionStorage.setItem("token", session.token);
                    userSessions[sessionChannel] = session[sessionChannel];
                    this.setState({
                        sessionChannel: sessionChannel,
                        userSessions: userSessions
                    })
                })
            } else {
                response.json().then((data) => {
                    alert(data.error);
                })
            }
        }).catch((response) =>{
            console.log(response);
        })
    }
    handleUpdateSessionTimestamp() {
        const userSessions = JSON.parse(JSON.stringify(this.state.userSessions));
        let token = window.sessionStorage.token;

        fetch('/api/session/update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({token: token})
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    return;
                })
            } else {
                response.json().then((data) => {
                    alert(data.error);
                })
            }
        }).catch((response) => {
            console.log(response);
        })
    }

    getUserSessions() {
        fetch(`/api/session?user=${this.props.username}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    this.setState({
                        userSessions: data.sessions
                    })
                });
            } else {
                response.json().then((data) => {
                    alert(data.error);
                })
            }
        }).catch((response) =>{
            console.log(response);
        })
    }

    render() {
        return (
            <div id="panel">
                <div id= "navbar">
                    <div id="logo">
                        <h1>BELAY</h1>
                        <p>1.0.0</p>
                    </div>
                    {this.props.username && 
                        <Nav
                            username={this.props.username}
                            sessionChannel={this.state.sessionChannel}
                            unreads={this.state.unreads}
                            
                            getUserSessions={this.getUserSessions}
                            userSessions={this.state.userSessions}
                            
                            handleLogout={this.props.handleLogout}
                            handleSwitchSession={this.handleSwitchSession}
                            onClickBackHome={this.handleBackHome}        
                        />
                    }
                </div>
                {this.props.username && 
                    <Screen 
                        username={this.props.username}
                        sessionChannel={this.state.sessionChannel}

                        handleInputChange={this.handleInputChange}
                        handleCreateChannel={this.handleCreateChannel}
                        handleCreateSession={this.handleCreateSession}
                    />
                }
            </div>
        );
    }
}



/* ------------------------------------------------------------
                        Register                                
------------------------------------------------------------ */

function Login(props) {
    return (
        <div id="login" className="register-box">
            <input type="text" name="email" placeholder="Email" onChange={props.onInputChange}/><br/>
            <input 
                type="password" name="password" placeholder="Password" 
                onChange={props.onInputChange}
            /><br/>
            <button id="login-button" onClick={props.onLogin}>Log in</button><br/>
            
            <div className="switch-register">
                <p>Don't have an account? <a href="#" onClick={props.onSwitchToSignup}>Sign up</a></p>
            </div>
        </div>
    );
}

function Signup(props) {
    return (
        <div id="signup" className="register-box">
            <input type="text" name="email" placeholder="Email" onChange={props.onInputChange}/><br/>
            <input 
                type="text" name="username" placeholder="Username (1-20 characters)" maxLength="20"
                onChange={props.onInputChange}
            /><br/>
            <input 
                type="password" name="password" placeholder="Password (8-20 characters)" maxLength="20"
                onChange={props.onInputChange}
            /><br/>
            <button id="signup-button" onClick={props.onSignup}>Sign up</button><br/>
            <div className="switch-register">
                <p>Already have an account? <a href="#" onClick={props.onSwitchToLogin}>Log in</a></p>
            </div>
        </div>
    );
}

class Register extends React.Component { 
    constructor(props) {
        super(props);
        this.state = {
            type: this.props.type,
        }        
        this.handleSwitchType = this.handleSwitchType.bind(this);
    }
    
    handleSwitchType() {
        this.setState({
            type: this.state.type === "login" ? "signup" : "login",
        })
        let inputElements = document.querySelectorAll("#register input");
        for (let i = 0; i < inputElements.length; i++) {
            inputElements[i].value = '';
        }
    }
    
    render() {
        let register;
        if (this.state.type === "login") {
            register = (
                <Login 
                    onInputChange={this.props.handleInputChange}
                    onLogin={this.props.handleLogin}
                    onSwitchToSignup={this.handleSwitchType}
                />
            );
        } else if (this.state.type === "signup"){
            register = (
                <Signup
                    onInputChange={this.props.handleInputChange}
                    onSignup={this.props.handleSignup}
                    onSwitchToLogin={this.handleSwitchType}
                />
            );
        } else {
            // update
        }
        return (
            <div className="popup">
                <div id="register" className="popup-box">{ register }</div>
            </div>
        );
    }
}



/* ------------------------------------------------------------
                    App Controller                               
------------------------------------------------------------ */

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: window.localStorage.username,
        }

        this.registerFields = {};
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleSignup = this.handleSignup.bind(this);

        this.handleLogout = this.handleLogout.bind(this);
    }

    handleInputChange(e) {
        let field = e.target.name;
        let value = e.target.value;
        this.registerFields[field] = value;
    }
    handleLogin() {
        let email = this.registerFields.email;
        let password = this.registerFields.password;

        if ((!email || !/.+@\w+(\.\w+)+$/.test(email)) || !password) {
            alert("Please check your inputs.");
            return;
        }

        fetch("/api/register/login", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: email, password: password})
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    window.localStorage.setItem('username', data.username)
                    this.setState({
                        username: data.username,
                    })
                });
            } else {
                response.json().then((data) => {
                    alert(data.error);
                })
            }
        }).catch((response) =>{
            console.log(response);
        })
    }
    handleSignup() {
        let email = this.registerFields.email;
        let username = this.registerFields.username;
        let password = this.registerFields.password;

        if ((!email || !/.+@\w+(\.\w+)+$/.test(email)) || !username || (!password || password.length < 8)) {
            alert("Please check your inputs.")
            return;
        }

        fetch("/api/register/signup", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: email, username: username, password: password})
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    window.localStorage.setItem('username', data.username)
                    this.setState({username: data.username})
                });
            } else {
                response.json().then((data) => {
                    alert(data.error);
                })
            }
        }).catch((response) =>{
            console.log(response);
        })
    }
    handleLogout() {
        window.localStorage.clear();
        window.sessionStorage.clear();
        this.setState({
            username: '',
        });
    }

    render() {
        return (
            <div id="app">
                <Panel 
                    username={this.state.username}
                    handleLogout={this.handleLogout}
                />
                {!this.state.username && 
                    <Register 
                        type="login"
                        handleInputChange={this.handleInputChange}
                        handleLogin={this.handleLogin}
                        handleSignup={this.handleSignup}
                    />
                }
            </div>
        );
    }
}


ReactDOM.render(<App />, document.getElementById('root'));