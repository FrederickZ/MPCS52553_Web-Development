create table user (
    usr_id      INT             AUTO_INCREMENT,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    username    VARCHAR(40)     NOT NULL UNIQUE,
    password    VARCHAR(60)     NOT NULL UNIQUE,
    PRIMARY KEY (usr_id)
);

create table channel (
    cnl_id      INT             AUTO_INCREMENT,
    name        VARCHAR(80)     NOT NULL UNIQUE,
    creater     INT             NOT NULL,
    PRIMARY KEY (cnl_id),
    FOREIGN KEY (creater) REFERENCES user(usr_id)
);

-- create table message {
--     channel INT,
--     message_id INT AUTO_INCREMENT,
--     sender INT,
--     content TEXT, 
--     PRIMARY KEY (channel_id, message_id),
--     FOREIGN KEY (channel) REFERENCES channel(channel_id),
--     FOREIGN KEY (sender) REFERENCES user(user_id)
-- } ENGINE=MyISAM;

-- create table reply {
--     message INT,
--     reply_id INT AUTO_INCREMENT,
--     sender INT,
--     content TEXT
--     PRIMARY KEY (message_id, reply_id),
--     FOREIGN KEY (message) REFERENCES message(message),
--     FOREIGN KEY (sender) REFERENCES user(user_id)
-- };