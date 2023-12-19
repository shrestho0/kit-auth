CREATE TABLE User (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PasswordCredentials (
    user_id TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
); 

-- there could be multiple login methods for an account/user
CREATE TABLE AuthCredentials (
    user_id TEXT,
    provider TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);