

export enum OAUTH_CALLBACK_ACTIONS {
    LOGIN = "login", //login
    REGISTER = "register", // register
    MERGE = "merge", // merge with existing account, logs in with new
    LINK = "merge", // No confirmation, link with existing logged in account
    NONE = "none"
}

export enum AUTH_RESPONSES {
    CONFIRM = "confirm", // take confirmation to merge or register
    SUCCESS_REDIRECT = "success_redirect", // successfully logged in or registered, redirect to home page with message
    SHOW_ERROR = "show_error", // show error message, maybe broken link, expired link, etc
}