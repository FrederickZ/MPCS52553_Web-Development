const navColumn = document.getElementById('nav');
const homeColumn = document.getElementById('home');
const chatColumn = document.getElementById('chat')
const threadsColumn = document.getElementById('threads');

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
    constructor(props){
        super(props);
    }
    render() {
        return (
            <div>
                <BackHome onBackHome={this.props.onShowHome}/>
                <p>channels nav</p>
            </div>
        )
    }
}



/* ------------------------------------------------------------
                        Register                                
------------------------------------------------------------ */

function Register(props) {
    let username = props.username;
    if (username) {
        return (
            <p>Hi, {username}!</p>
        )
    } else {
        return (
            <button>Register</button>
        )
    }
    
}

// class RegisterBox extends React.Component {

// }



/* ------------------------------------------------------------
                           Chat                                
------------------------------------------------------------ */

class Chat extends React.Component {
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
        let panel;
        if (this.props.isChat) {
            panel = <Chat />;
        } else {
            panel = <Home />;
        }
        return (
            <div id="panel">
                <Register
                    username={this.props.username}
                />
                {panel}
            </div>
        )
    }

    
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: 'FrederickZ',
            isChat: true,
        }
    }

    render() {
        return (
            <div id="app">
                <div id="nav">
                    <Nav 
                        onShowHome={() => this.showHome()}
                    />
                </div>
                <Panel 
                    isChat={this.state.isChat}
                    username={this.state.username}
                />
                
            </div>
        )
    }
    showHome() {
        this.setState({
            isChat: false,
        })
    }
}


ReactDOM.render(<App />, document.getElementById('root'))