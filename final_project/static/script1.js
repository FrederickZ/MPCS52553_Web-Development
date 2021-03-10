const storage = window.localStorage;

/* ------------------------------------------------------------
                          Chat                                
------------------------------------------------------------ */

class Chat extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div id="chat">
                <div id="messages-scroll">
                    <p>messages</p>
                </div>
                <div id="chat-box">
                    <p>chat box</p>
                </div>
            </div>
        );
    }
}

/* ------------------------------------------------------------
                           Home                                
------------------------------------------------------------ */

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            channels: []
        }
    }

    componentDidMount() {
        fetch("/api/channel", {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    this.setState({
                        channels: data.channels,
                    })
                })
            } else {
                console.log(response.status);
            }
        }).catch((response) =>{
            console.log(response);
        })
    }

    render() {
        const channel_blocks = this.state.channels.map(item => 
            <div key={item.id} className="channel-block">
                <h4>{item.name}</h4>
                <small>Host: {item.host}</small>
            </div>
        );
        return (
            <div id="home">
                <div id="channels-list">
                    {channel_blocks}
                </div>
                <div id="create-channel-div">
                    <input id= "new-channel-input" type="text" maxLength="40" onChange={this.props.inputHandler}
                        placeholder="Channel name (1-9, a-z, and '_' only; 1-40 characters)"
                    />
                    <button id="create-channel-btn" onClick={this.props.channelCreator}>CREATE</button>
                </div>
            </div>
        );
    }    
}

class UI extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        if (storage.getItem('currentChannel') != 0) {
            return <Chat username={this.props.username}/>
        } else {
            return <Home 
                username={this.props.username}
                inputHandler={this.props.inputHandler}
                channelCreator={this.props.channelCreator}
            />
        }
    }
}


/* ------------------------------------------------------------
                            Nav                                
------------------------------------------------------------ */

class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userChannels: [],
        }
    }



    componentDidMount() {
        if (!this.props.username) {
            return;
        }

        fetch(`/api/channel?user=${this.props.username}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    this.setState({
                        userChannels: data.channels,
                    })
                })
            } else {
                console.log(response.status);
            }
        }).catch((response) =>{
            console.log(response);
        })
    }

    render() {
        const channel_tabs = this.state.userChannels.map(item => 
            <div key={item.id}>
                <h4>{item.name}</h4>
            </div>
        );
        return (
            <div id="nav">
                <div id="logo">
                    <h1>BELAY</h1>
                    <small>1.0.0</small>
                </div>
                <div>{channel_tabs}</div>
                <button id="back-home" onClick={this.props.homeSwitcher}><i className="material-icons">add</i></button>
                {this.props.username && 
                    <div id="profile">
                        <p>Hi, {this.props.username}</p>
                        <button><i className="material-icons">settings</i></button>
                        <button onClick={this.props.logoutHandler}><i className="material-icons">logout</i></button>
                    </div>
                }
            </div>
        )
    }
}


/* ------------------------------------------------------------
                             Panel                          
------------------------------------------------------------ */

class Panel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            allChannels: [],
            userChannels: [],
        }

        this.newChannelName = '';
        this.inputHandler = this.handleInput.bind(this);
        this.channelCreator = this.createChannel.bind(this);
        this.homeSwitcher = this.switchToHome.bind(this);

        this.newSessionChannelId = 0;
    }
    
    render() {
        return (
            <div id="panel">
                <Nav 
                    username={this.props.username}
                    logoutHandler={this.props.logoutHandler}
                    homeSwitcher={this.homeSwitcher}
                />
                <div id="ui">
                    <UI 
                        username={this.props.username} 
                        allChannelsGetter={this.allChannelsGetter}
                        channelCreator={this.channelCreator}
                        inputHandler={this.inputHandler}
                    />
                </div>
                
            </div>
        )
    }

    handleInput(e) {
        this.newChannelName = e.target.value
    }

    createChannel() {
        let name = this.newChannelName;
        if (!name || !/^[a-z0-9_]+$/.test(name)) {
            alert(`Invalid: ${name}`);
            return;
        }

        fetch('/api/channel/create', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user: this.props.username, name: name})
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    console.log(data)
                    this.newSessionChannelId = data.id
                    this.createSession()
                })
            } else {
                console.log(response.status);
            }
        }).catch((response) =>{
            console.log(response);
        })
    }

    createSession() {
        fetch('/api/session/create', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user: this.props.username, channel_id: this.newSessionChannelId})
        }).then((response) => {
            if (response.status == 200) {
                response.json().then((data) => {
                    console.log(data)
                    storage.setItem("currentChat", data.id)
                })
            } else {
                console.log(response.status);
            }
        }).catch((response) =>{
            console.log(response);
        })
    }

    switchToHome() {
        storage.setItem("currentChat", 0)
        this.setState({
            channelId: '',
        })
    }
}



/* ------------------------------------------------------------
                        App + Register                                
------------------------------------------------------------ */

function Login(props) {
    return (
        <div id="login" style={{display: (this.state.isLogin ? "block" : "none")}}>
            <h3>LOG IN</h3>
            <input type="text" name="email" placeholder="Email" onChange={this.props.inputHandler}/><br/>
            <input 
                type="password" name="password" placeholder="Password" 
                onChange={this.props.inputHandler}
            /><br/>
            <button id="login-button" onClick={this.props.loginHandler}>Log in</button><br/>
            <small>
                Don't have an account? 
                <button onClick={this.props.registerSwitcher}>SIGN UP</button>
            </small>
        </div>
    )
}

function Signup(props) {
    return (
        <div id="signup" style={{display: (this.state.isLogin ? "none" : "block")}}>
            <h3>CREATE AN ACCOUNT</h3>
            <input type="text" name="email" placeholder="Email" onChange={this.props.inputHandler}/><br/>
            <input 
                type="text" name="username" placeholder="Username (1-20 characters)" maxLength="20"
                onChange={this.props.inputHandler}
            /><br/>
            <input 
                type="password" name="password" placeholder="Password (8-20 characters)" maxLength="20"
                onChange={this.props.inputHandler}
            /><br/>
            <button id="signup-button" onClick={this.props.signupHandler}>Sign up</button><br/>
            <small>
                Already have an account? 
                <button onClick={this.switchRegister}>LOG IN</button>
            </small>
        </div>
    )
    
}


class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: true,
        }
        this.inputHandler = this.handleInput.bind(this);
        this.loginHandler = this.handleLogin.bind(this);
        this.signupHandler = this.handleSignup.bind(this);
        this.registerSwitcher = this.switchRegister.bind(this);
    }
    
    render() {
        return (
            <div id="register" className="popup">
                <div id="register-box" className="popup-box">
                    <Login
                        isLogin={this.state.isLogin} 
                        registerSwitcher={this.registerSwitcher} 
                    />
                    <Signup 

                    />
                </div>
            </div>
        )
    }

    switchRegister() {
        this.setState({
            isLogin: !this.state.isLogin,
        })
        let inputElements = document.querySelectorAll("#register input");
        for (let i = 0; i < inputElements.length; i++) {
            inputElements[i].value = '';
        }
    }
    handleInput(e) {
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
                    this.setState({username: data.username})
                    storage.setItem('username', data.username)
                });
            } else {
                console.log(response.status);
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
                    console.log(data)
                    this.setState({username: data.username})
                    storage.setItem('username', data.username)
                    storage.setItem('userChannels', [])
                });
            } else {
                console.log(response.status);
            }
        }).catch((response) =>{
            console.log(response);
        })
    }
    handleLogout() {
        this.setState({username: null})
        storage.clear()
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: storage.getItem('username') ? storage.getItem('username') : '',
        }

        this.registerFields = {};
        
        this.logoutHandler = this.handleLogout.bind(this);
    }

    render() {
        return (
            <div id="app">
                <Panel
                    username={this.state.username}
                    logoutHandler={this.logoutHandler}
                />
                {!this.state.username && 
                    <Register 
                        inputHandler={this.inputHandler}
                        loginHandler={this.loginHandler}
                        signupHandler={this.signupHandler}
                    />
                }
            </div>
        )
    }


}

ReactDOM.render(<App />, document.getElementById('root'))