CREATE TABLE IF NOT EXISTS user (
    username    VARCHAR(40),
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(60)     NOT NULL UNIQUE,
    PRIMARY KEY (username)
);

CREATE TABLE IF NOT EXISTS channel (
    id         INT             AUTO_INCREMENT,
    name       VARCHAR(60)     NOT NULL UNIQUE,
    host       VARCHAR(40)     NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (host)      REFERENCES user(username)
);

CREATE TABLE IF NOT EXISTS session (
    token       CHAR(16),
    channel     INT             NOT NULL,
    user        VARCHAR(40)     NOT NULL,
    create_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (token),
    FOREIGN KEY (channel)   REFERENCES channel(id),
    FOREIGN KEY (user)      REFERENCES user(username)
);

create table message {
    channel INT,
    message_id INT AUTO_INCREMENT,
    sender INT,
    content TEXT, 
    PRIMARY KEY (channel_id, message_id),
    FOREIGN KEY (channel) REFERENCES channel(channel_id),
    FOREIGN KEY (sender) REFERENCES user(user_id)
} ENGINE=MyISAM;