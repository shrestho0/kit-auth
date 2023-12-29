

export enum OAUTH_CALLBACK_ACTIONS {
    LOGIN, //login
    REGISTER, // register
    MERGE, // merge with existing account, logs in with new
    LINK, // No confirmation, link with existing logged in account
}

export enum OAUTH_CALLBACK_RESPONSES {
    CONFIRM, // take confirmation to merge or register
    SUCCESS_REDIRECT, // successfully logged in or registered, redirect to home page with message
    SHOW_ERROR, // show error message, maybe broken link, expired link, etc
}