const storage = window.localStorage;

/* ------------------------------------------------------------
                            Nav                                
------------------------------------------------------------ */

class Nav extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let username = this.props.username; 
        return (
            <div>
                <button onClick={this.props.homeSwitcher}><i className="material-icons">add</i></button>
                <p>channels nav</p>
                {username && 
                    <p><button><i className="material-icons">settings</i></button>Hi, {username}</p>
                }
            </div>
        )
    }
}

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

class Channel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div></div>)
    }
}


class Home extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div id="home">
                <h1>Welcome to Belay!</h1>
                <button onClick={this.newChannelHandler}></button>
                <div id="channels-list">
                    <p>channels list</p>
                </div>
            </div>
        );
    }
}



/* ------------------------------------------------------------
                        Register                                
------------------------------------------------------------ */

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: (this.props.registerType==='login') ? true : false,
        }
        this.resetRegister = this.resetRegister.bind(this);
        this.switchRegister =this.switchRegister.bind(this);
    }
    
    render() {
        return (
            <div id="register" className="popup">
                <div id="register-box" className="popup-box">
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
                            <button onClick={this.switchRegister}>SIGN UP</button>
                        </small>
                    </div>
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
                </div>
            </div>
        )
    }

    resetRegister() {
        let inputElements = document.querySelectorAll("#register input");
        for (let i = 0; i < inputElements.length; i++) {
            inputElements[i].value = '';
        }
    }

    switchRegister() {
        this.setState({
            isLogin: !this.state.isLogin,
        })
        this.resetRegister();
    }
}


/* ------------------------------------------------------------
                        Controller                                
------------------------------------------------------------ */

class Panel extends React.Component {
    constructor(props) {
        super(props)
    }
    
    render() {
        if (this.props.isChat) {
            return <Chat username={this.props.username}/>
        } else {
            return <Home />
        }
    }    
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: storage.getItem('username'),
            isChat: true,
        }

        this.registerFields = {};
        this.inputHandler = this.handleInput.bind(this);
        this.loginHandler = this.handleLogin.bind(this);
        this.signupHandler = this.handleSignup.bind(this);
        
        this.homeSwitcher = this.switchToHome.bind(this);
        this.getChannelsHandler = this.getChannels.bind(this);
    }

    render() {
        return (
            <div id="app">
                <div id="main">
                    <div id="nav">
                        <Nav username={this.state.username} homeSwitcher={this.homeSwitcher} />
                    </div>
                    <div id="panel">
                        <Panel isChat={this.state.isChat} username={this.state.username} />
                    </div>
                </div>
                {!this.state.username && 
                    <Register 
                        registerType="login"
                        fields={this.registerFields}
                        inputHandler={this.inputHandler}
                        loginHandler={this.loginHandler}
                        signupHandler={this.signupHandler}
                    />
                }
            </div>
        )
    }

    switchToHome() {
        if (!this.state.username) {
            document.getElementById("register").style.display = "block";
        }
        this.setState({
            isChat: false,
        })
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
            if(response.status == 200) {
                response.json().then((data) => {
                    console.log(data)
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
            if(response.status == 200) {
                response.json().then((data) => {
                    console.log(data)
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

    getChannels() {
        
    }
}

ReactDOM.render(<App />, document.getElementById('root'))