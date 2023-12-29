

type PreJWTPayloadObject = {
    id: string;
    username: string;
}

type JWTTokenObject = {
    access: string | null;
    refresh: string | null;
    provider: oAuthProviders | null;
}

type JWTPayload = {
    _data: string; // base64 encoded string with id and usrename
    iat?: number;
    exp?: number;
}

type GoogleIdTokenPayload = {
    email: string;
    email_verified: boolean;
    verified: boolean;
    name: string;
    picture: string;
}

type OauthPageRequestedFromPage = "register" | "login" | "link" | undefined;

type GoogleOauthTempData = {
    provider: string,
    oauth_refresh_token?: string,
    oauth_refresh_expiry_date?: number,
    oauth_user_email: string,
    oauth_user_name?: string,
    oauth_user_picture?: string,
    oauth_user_email_verified?: boolean,
}


type Tokens = {
    accessToken: string;
    refreshToken: string;
}

type oAuthProviders = "password" | "google" | "github"

type SUCCESS_RESPONSE_CODES = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226;
type REDIRECT_RESPONSE_CODES = 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308;
type CLIENT_ERROR_RESPONSE_CODES = 400 | 401 | 403 | 404 | 405 | 406 | 409 | 410 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451 | 499;
type SERVER_ERROR_RESPONSE_CODES = 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511 | 599;



// enum OAUTH_CALLBACK_OPTIONS {
//     REDIRECT,
//     LINK_ACCOUNTS,
//     NO_ACCOUNT_EXISTS
// }

type OAUTH_CALLBACK_RESPONSE_STATUS = "REDIRECT" | "LINK_ACCOUNTS";
type OAUTH_CALLBACK_RESPONSE_STATUS_TYPE = "LOGIN" | "REGISTER" | "LINK_ACCOUNTS";