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
    }

    render() {
        return (
            <div id="register">
                <div id="register-nav">
                    <button id="signin-button">Sign in</button>
                    <button id="signup-button">Sign up</button>
                    <button 
                        id="close-register" 
                        onClick={() => { document.getElementById("register").style.display="none" }}
                    >&times;</button>
                </div>
                <div id="signin">
                    <form>
                        <label>
                            Email:
                            <input type="text" name="email" /><br/>
                        </label>
                        <label>
                            Password:
                            <input type="text" name="password" /><br/>
                        </label>
                        <input type="submit" value="Sign in" />
                    </form>
                </div>
                <div id="signup">
                    <form>
                        <label>
                            Email:
                            <input type="text" name="email" /><br/>
                        </label>
                        <label>
                            Username:
                            <input type="text" name="username" /><br/>
                        </label>
                        <label>
                            Password:
                            <input type="text" name="password" /><br/>
                        </label>
                        <input type="submit" value="Sign up" />
                    </form>
                </div>
            </div>
        )
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
                { username && <p><button><i className="material-icons">settings</i></button>Hi, {username}</p> }
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
            username: null,
            isChat: true,
        }
    }

    render() {
        return (
            <div id="app">
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
                {!this.state.username && <Register />}
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