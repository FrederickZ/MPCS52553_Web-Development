
class Screen extends React.Component {}



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
            <p>Hi, {storage.username}</p>
            <button variant="light"><i className="material-icons">settings</i></button>
            <button variant="light" onClick={props.onClickLogout}><i className="material-icons">logout</i></button>
        </div>
    )
}

class Nav extends React.Component {
    render() {
        return (
            <div id="nav">
                <ChannelTabsBar 
                    userChannelsGetter={this.getUserChannels}
                />
                <button variant="light"><i className="material-icons">add</i></button>
                <Profile onClickLogout={this.props.handleLogout}/>
            </div>
        );
    }
}

class Navbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userChannels: []
        }
    }

    
    
    render() {
        return (
            <div id="navbar">
                <Logo />
                {this.props.username && <Nav />}
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

        this.handleLogout = this.handleLogout.bind(this);
    }

    handleLogout() {
        storage.clear();
    }

    render() {
        return (
            <div id="panel">
                <Navbar handleLogout={this.props.handleLogout}/>
                {this.props.username && <Screen />}
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
            <button id="login-button" onClick={props.onSubmit}>Log in</button><br/>
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
            <button id="signup-button" onClick={props.onSubmit}>Sign up</button><br/>
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
            fields: {},
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
                    onSubmit={this.props.handleSubmitLogin}
                    onSwitchToSignup={this.handleSwitchType}
                />
            );
        } else {
            register = (
                <Signup
                    onInputChange={this.props.handleInputChange}
                    onSubmit={this.props.handleSubmitSignup}
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
        }
        this.registerFields = {}
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmitLogin = this.handleSubmitLogin.bind(this);
        this.handleSubmitSignup = this.handleSubmitSignup.bind(this);
    }

    handleInputChange(e) {
        let field = e.target.name;
        let value = e.target.value;
        this.registerFields[field] = value;
    }
    handleSubmitLogin() {
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
                    this.setState({username: data.username})
                });
            } else {
                console.log(response.status);
            }
        }).catch((response) =>{
            console.log(response);
        })
    }
    handleSubmitSignup() {
        let email = this.state.fields.email;
        let username = this.state.fields.username;
        let password = this.state.fields.password;

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
                console.log(response.status);
            }
        }).catch((response) =>{
            console.log(response);
        })
    }

    render() {
        return (
            <div id="app">
                <Panel username={this.state.username}/>
                {!this.state.username && 
                    <Register 
                        type="login"
                        handleInputChange={this.handleInputChange}
                        handleSubmitLogin={this.handleSubmitLogin}
                        handleSubmitSignup={this.handleSubmitSignup}
                    />
                }
            </div>
        );
    }
}


ReactDOM.render(<App />, document.getElementById('root'));