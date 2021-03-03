const navColumn = document.getElementById('nav');
const homeColumn = document.getElementById('home');
const chatColumn = document.getElementById('chat')
const threadsColumn = document.getElementById('threads');

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

class Panel extends React.Component {
    constructor(props) {
        super(props)
    }
    

    render() {
        const isChat = this.props.isChat;
        if (isChat) {
            return <Chat />;
        }
        return <Home />;
    }

    
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
                <div id="panel">
                    <Panel 
                        isChat={this.state.isChat}
                    />
                </div>
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