/* ------------------------------------------------------------
                            Chat         
------------------------------------------------------------ */

class Message extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="message">
                message
            </div>
        );
    }
}

class MessagesBox extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="messages-box">
                messages box
            </div>
        )
    }
}

class Chat extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        // polling new message number
        return;
    }

    render() {
        return (
            <div id="chat">
                <MessagesBox />
                <div id="new-message">
                    <input 
                        type="text" name="new-message-content"
                    />
                    <button id="new-message-button">Send</button>
                </div>
            </div>
        )
    }
}






/* ------------------------------------------------------------
                            Home                               
------------------------------------------------------------ */


function ChannelBlock(props) {
    return (
        <div id={"block-"+props.channel.channel} onClick={props.onClickChannelBlock}>
            {props.channel.channel}
        </div>
    )
}

function ChannelBlocksBar(props) {
    const channelBlocks = props.channels.map(item => 
        <ChannelBlock 
            key={item.channel}
            channel={item}
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
            channels: []
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
                    this.setState({channels: data.channels});
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
                <p>search bar</p>
                <ChannelBlocksBar 
                    channels={this.state.channels}
                    handleClickChannelBlock={this.props.handleCreateSession}
                />
                <div id="create-channel">
                    <input 
                        type="text" name="new-channel-name" placeholder="1-40 characters; a-z, 0-9, '_' only" 
                        onChange={this.props.onInputChange}
                    />
                    <button id="create-channel-button" onClick={this.props.onCreateChannel}>Create Channel</button>
                </div>
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
        if (!this.props.channel) {
            screen = (
                <Home 
                    onInputChange={this.props.handleInputChange}
                    onCreateChannel={this.props.handleCreateChannel}
                    handleCreateSession={this.props.handleCreateSession}
                />
            );
        } else {
            screen = (
                <Chat />
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


function Logo(props) {
    return (
        <div id="logo">
            <h1>BELAY</h1>
            <small>1.0.0</small>
        </div>
    );
}

class ChannelTab extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // polling new message number
        return;
    }

    render() {
        return (
            <div id={'tab-'+this.props.channel.channel} className="channel-tab" onClick={this.props.onClickChannelTab}>
                {this.props.channel.channel}
            </div>
        );
    }
}

class ChannelTabsBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const channelTabs = this.props.userChannels.map(item => 
            <ChannelTab 
                key={item.token}
                channel={item}
                onClickChannelTab={this.props.handleClickChannelTab}
            />
        );
        return (
            <div id="channel-tabs-bar">
                {channelTabs}
            </div>
        )
    }
    
}

function Profile(props) {
    return (
        <div id="profile">
            <p>Hi, {window.localStorage.username}</p>
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
        this.props.getUserChannels();
    }

    render() {
        return (
            <div id="nav">
                <ChannelTabsBar 
                    userChannels={this.props.userChannels}
                    handleClickChannelTab={this.props.handleSwitchChannel}
                />
                <button variant="light" onClick={this.props.onClickBackHome}><i className="material-icons">add</i></button>
                <Profile
                    username={this.props.username}
                    onClickLogout={this.props.handleClickLogout}
                />
            </div>
        );
    }
}

class Navbar extends React.Component {
    constructor(props) {
        super(props);

        this.handleClickLogout = this.handleClickLogout.bind(this)
    }

    handleClickLogout() {
        this.props.handleBackHome();
        this.props.handleLogout();
    }

    render() {
        return (
            <div id="navbar">
                <Logo />
                {this.props.username && 
                    <Nav 
                        username={this.props.username}
                        userChannels={this.props.userChannels}
                        onClickBackHome={this.props.handleBackHome}
                        handleClickLogout={this.handleClickLogout}
                        handleSwitchChannel={this.props.handleSwitchChannel}
                        getUserChannels={this.props.getUserChannels}
                    />
                }
            </div>
        )
    };
}

/* ------------------------------------------------------------
                    Panel Controller                                
------------------------------------------------------------ */

class Panel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            channel: window.sessionStorage.channel,
            userChannels: [],
        }

        this.getUserChannels = this.getUserChannels.bind(this);
        this.handleSwitchChannel = this.handleSwitchChannel.bind(this);

        this.handleBackHome = this.handleBackHome.bind(this);

        this.newChannel = ''
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleCreateChannel = this.handleCreateChannel.bind(this);
        this.handleCreateSession = this.handleCreateSession.bind(this);

        
        
        
        
    }

    handleBackHome() {
        window.sessionStorage.clear()
        this.setState({channel: ''})
    }
    handleSwitchChannel(e) {
        let channel = e.target.id.substring(4);
        console.log(e.target)
        window.sessionStorage.setItem("channel", channel)
        this.setState({channel: channel});
    }
    handleInputChange(e) {
        this.newChannel = e.target.value;
    }
    handleCreateChannel() {
        const userChannels = this.state.userChannels.slice();
        let channel = this.newChannel;
        if (!channel || !/^[a-z0-9_]+$/.test(channel)) {
            alert(`Invalid channel name: ${channel}`);
            return;
        }

        fetch('/api/channel/create', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user: this.props.username, channel: channel})
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    console.log(data)
                    window.sessionStorage.setItem("channel", data.channel);
                    this.setState({
                        channel: data.channel,
                        userChannels: userChannels.concat([data])
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
        let channel = e.target.id.substring(6);
        for (let i = 0; i < this.state.userChannels.length; i++) {
            if (channel === this.state.userChannels[i].channel) {
                window.sessionStorage.setItem("channel", channel)
                this.setState({channel: channel});
                return;
            }
        }

        const userChannels = this.state.userChannels.slice();
        fetch('/api/session/create', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user: this.props.username, channel: channel})
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    console.log(data)
                    window.sessionStorage.setItem("channel", data.channel);
                    this.setState({
                        channel: data.channel,
                        userChannels: userChannels.concat([{
                            channel: data.channel,
                            token: data.token,
                            isHost: data.isHost,
                            createAt: data.createAt,
                            lastActive: data.lastActive
                        }])
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

    getUserChannels() {
        fetch(`/api/channel?user=${this.props.username}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    this.setState({
                        userChannels: data.channels
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
                <Navbar 
                    getUserChannels={this.getUserChannels}

                    username={this.props.username}
                    userChannels={this.state.userChannels}
                    handleLogout={this.props.handleLogout}
                    handleSwitchChannel={this.handleSwitchChannel}
                    handleBackHome={this.handleBackHome}
                    
                />
                {this.props.username && 
                    <Screen 
                        username={this.props.username}
                        channel={this.state.channel}
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
        <div id="login">
            <h3>LOG IN</h3>
            <input type="text" name="email" placeholder="Email" onChange={props.onInputChange}/><br/>
            <input 
                type="password" name="password" placeholder="Password" 
                onChange={props.onInputChange}
            /><br/>
            <button id="login-button" onClick={props.onLogin}>Log in</button><br/>
            <small>
                Don't have an account? 
                <button onClick={props.onSwitchToSignup}>SIGN UP</button>
            </small>
        </div>
    );
}

function Signup(props) {
    return (
        <div id="signup">
            <h3>CREATE AN ACCOUNT</h3>
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
            <small>
                Already have an account? 
                <button onClick={props.onSwitchToLogin}>LOG IN</button>
            </small>
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
            <div id="register" className="popup">
                <div id="register-box" className="popup-box">{ register }</div>
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