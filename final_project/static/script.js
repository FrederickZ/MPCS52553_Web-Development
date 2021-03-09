
class Screen extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div id="screen"></div>)
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

function ChannelTab(props) {    
    return (
        <div className="channel-tab" key={props.id}>
            <h4>{props.name}</h4>
        </div>
    );
}

class ChannelTabsBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userChannels: [],
        };
    }

    render() {
        return null
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
    render() {
        return (
            <div id="nav">
                <ChannelTabsBar 
                    userChannelsGetter={this.getUserChannels}
                />
                <button variant="light"><i className="material-icons">add</i></button>
                <Profile 
                    onClickLogout={this.props.handleLogout}
                />
            </div>
        );
    }
}

class Navbar extends React.Component {
    constructor(props) {
        super(props);

        this.handleClickBackHome = this.handleClickBackHome.bind(this)
        this.handleClickLogout = this.handleClickLogout.bind(this)
    }

    handleClickLogout() {
        this.props.handleBackHome();
        this.props.handleLogout();
    }
    handleClickBackHome() {
        this.props.handleBackHome();
    }

    render() {
        return (
            <div id="navbar">
                <Logo />
                {this.props.username && 
                    <Nav 
                        username={this.props.username}
                        channelId={this.props.channelId}
                    />}
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
            channelId: window.sessionStorage.channelId,
            userChannels: []
        }
        this.handleBackHome = this.handleBackHome.bind(this);
        this.handleSwitchChannel = this.handleSwitchChannel.bind(this);
    }

    handleBackHome() {
        window.sessionStorage.clear()
        this.setState({channelId: 0})
    }
    handleSwitchChannel(e) {
        this.setState({channelId: e.target.key});
    }
    handleEnterChannel() {}

    render() {
        return (
            <div id="panel">
                <Navbar 
                    username={this.props.username}
                    handleLogout={this.props.handleLogout}
                    handleBackHome={this.handleBackHome}
                />
                {this.props.username && 
                    <Screen 
                        username={this.props.username}
                        channelId={this.state.channelId}
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
        } else {
            register = (
                <Signup
                    onInputChange={this.props.handleInputChange}
                    onSignup={this.props.handleSignup}
                    onSwitchToLogin={this.handleSwitchType}
                />
            );
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
            userChannels: []
        }

        this.registerFields = {};

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleSignup = this.handleSignup.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.getUserChannels = this.getUserChannels.bind(this);
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
                        username: data.username
                    })
                    this.getUserChannels();
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
        this.setState({username: ''});
    }
    getUserChannels() {
        let username = this.state.username;
        if (!username) {
            alert("user not logged in.")
            return;
        }
        fetch(`/api/channel?user=${username}`, {
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
        return (
            <div id="app">
                <Panel 
                    username={this.state.username}
                    handleLogout={this.handleLogout}
                    userChannels={this.userChannels}
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