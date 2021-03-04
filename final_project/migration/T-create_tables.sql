create table user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    password VARCHAR(60),
    username VARCHAR(40)
);

create table channel (
    channel_id INT AUTO_INCREMENT PRIMARY KEY,
    channel_name VARCHAR(80),
    creater INT,
    FOREIGN KEY (creater) REFERENCES user(user_id)
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

create table reply {
    message INT,
    reply_id INT AUTO_INCREMENT,
    sender INT,
    content TEXT
    PRIMARY KEY (message_id, reply_id),
    FOREIGN KEY (message) REFERENCES message(message),
    FOREIGN KEY (sender) REFERENCES user(user_id)
};