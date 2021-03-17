CREATE TABLE IF NOT EXISTS user (
    username    VARCHAR(40),
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(60)     NOT NULL UNIQUE,
    PRIMARY KEY (username)
);

CREATE TABLE IF NOT EXISTS session (
    token       CHAR(16),
    channel     VARCHAR(40)     NOT NULL,
    user        VARCHAR(40)     NOT NULL,
    is_host     BOOLEAN         NOT NULL DEFAULT false,
    create_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (token),
    FOREIGN KEY (user)          REFERENCES user(username),
    UNIQUE KEY (channel, user)
);

CREATE TABLE IF NOT EXISTS message (
    channel     VARCHAR(40),
    id          INT             AUTO_INCREMENT,
    user        VARCHAR(40)     NOT NULL,
    content     TEXT            NOT NULL,
    reply       INT             NOT NULL DEFAULT 0,
    time        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel, id),
    FOREIGN KEY (channel, user) REFERENCES session(channel, user),
    FOREIGN KEY (reply)         REFERENCES message(id)
) ENGINE=MyISAM;