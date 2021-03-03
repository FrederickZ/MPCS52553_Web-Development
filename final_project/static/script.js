const navColumn = document.getElementById('nav');
const homeColumn = document.getElementById('home');
const chatColumn = document.getElementById('chat')
const threadsColumn = document.getElementById('threads');

/* ------------------------------------------------------------
                        Register                                
------------------------------------------------------------ */
class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: (this.props.registerType==='login') ? true : false,
            fields: {},
            errors: {},
        }
        this.handleChange = this.handleChange.bind(this);
        this.checkRegisterInput = this.checkRegisterInput.bind(this);
        this.emailRegex = /.+@\w+(\.\w+)+/;
    }
    
    render() {
        return (
            <div id="register" className="popup">
                <div id="register-box" className="popup-box">
                    <button 
                        id="close-register" 
                        onClick={() => { 
                            document.getElementById("register").style.display="none";
                            this.resetRegister();
                        }}
                    >&times;</button>
                    <div id="login" style={{display: (this.state.isLogin ? "block" : "none")}}>
                        <h3>LOG IN</h3>
                        <form id="login-form" name="login-form" className="register-form" onSubmit={this.handleLogin}>
                            <input 
                                type="text" name="email" placeholder="Email" 
                                onChange={this.handleChange}
                            />
                            <span className="error">{this.state.errors.email}</span><br/>
                            <input 
                                type="password" name="password" placeholder="Password" 
                                onChange={this.handleChange}
                            />
                            <span className="error">{this.state.errors.password}</span><br/>
                            <input type="submit" value="Log in" />
                        </form>
                        <small>
                            Don't have an account? 
                            <button onClick={() => this.switchRegister()}>SIGN UP</button>
                        </small>
                    </div>
                    <div id="signup" style={{display: (this.state.isLogin ? "none" : "block")}}>
                        <h3>CREATE AN ACCOUNT</h3>
                        <form id="signup-form" name="signup-form" className="register-form" onSubmit={this.handleSignup}>
                            <input 
                                type="text" name="email" placeholder="Email" 
                                onChange={this.handleChange}
                            />
                            <span className="error">{this.state.errors.email}</span><br/>
                            <input 
                                type="text" name="username" placeholder="Username (1-20 characters)" maxLength="20"
                                onChange={this.handleChange}    
                            />
                            <span className="error">{this.state.errors.username}</span><br/>
                            <input 
                                type="password" name="password" placeholder="Password (8-20 characters)" maxLength="20"
                                onChange={this.handleChange}
                            />
                            <span className="error">{this.state.errors.password}</span><br/>
                            <input type="submit" value="Sign up"/>
                        </form>
                        <small>
                            Already have an account? 
                            <button onClick={() => this.switchRegister()}>LOG IN</button>
                        </small>
                    </div>
                </div>
            </div>

            
        )        
    }

    resetRegister() {
        document.getElementById("login-form").reset();
        document.getElementById("signup-form").reset();
        this.setState({
            fields: {},
            errors: {},
        })
    }

    switchRegister() {
        this.setState({
            isLogin: !this.state.isLogin,
        })
        this.resetRegister();
    }

    handleChange(event) {
        let fields = this.state.fields;
        let field = event.target.name;
        let value = event.target.value;
        fields[field] = value;
        this.setState({fields: fields});
        this.checkRegisterInput();
    }

    checkRegisterInput() {
        let fields = this.state.fields;
        let errors = {};
        
        if ('email' in fields) {
            let email = fields.email;
            if (!email) {
                errors['email'] = "Please enter your email address."
            } else if (!this.emailRegex.test(email)) {
                errors['email'] = "Invalid email address."
            }
        }

        if ('password' in fields) {
            let password = fields.password;
            if (!password) {
                errors['password'] = "Please enter your password."
            } 
            if (!this.state.isLogin && password.length < 8) {
                errors['password'] = "Password too short."
            }
        }

        if (!this.state.isLogin && 'username' in fields) {
            if (!fields.username) {
                errors['username'] = "Please create a username."
            }
        }

        if ('email' in errors || 'username' in errors || 'password' in errors) {
            this.setState({errors: errors});
            return false;
        } else {
            this.setState({errors: {}});
            return true;
        }
    }

    handleSubmit() {
        
    }
}



/* ------------------------------------------------------------
                            Nav                                
------------------------------------------------------------ */

function BackHome(props) {
    return (
        <button onClick={props.onBackHome}>
            <i className="material-icons">add</i>
        </button>
    )
}

class UserChannel extends React.Component {

}

class Nav extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let username = this.props.username; 
        return (
            <div>
                <BackHome onBackHome={this.props.onShowHome}/>
                <p>channels nav</p>
                { username ? 
                    <p><button><i className="material-icons">settings</i></button>Hi, {username}</p> : 
                    <button onClick={showRegister}>Register</button>
                }
            </div>
        )

        function showRegister() {
            document.getElementById("register").style.display = "block";
        }
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
                <div id="channels-list">
                    <p>channels list</p>
                </div>
            </div>
        );
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
            username: 'F',
            isChat: true,
        }
    }

    render() {
        return (
            <div id="app">
                <div id="main">
                    <div id="nav">
                        <Nav
                            username={this.state.username}
                            onShowHome={() => this.showHome()}
                        />
                    </div>
                    <div id="panel">
                        <Panel 
                            isChat={this.state.isChat}
                            username={this.state.username}
                        />
                    </div>
                </div>
                {!this.state.username && <Register registerType="login"/>}
            </div>
        )
    }
    showHome() {
        if (!this.state.username) {
            document.getElementById("register").style.display = "block";
        }
        this.setState({
            isChat: false,
        })
    }
}


ReactDOM.render(<App />, document.getElementById('root'))