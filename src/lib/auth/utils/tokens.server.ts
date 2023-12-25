import { DEVICE_TOKEN_COOKIE_NAME, JWT_ACCESS_EXPIRES, JWT_ACCESS_SECRET, JWT_COOKIE_NAME, JWT_REFRESH_EXPIRES, JWT_REFRESH_SECRET, MODE } from "$env/static/private";
import type { Cookies } from "@sveltejs/kit";
import { ulid, decodeTime } from "ulid";
import { ServerSideCookieUtility } from "./cookies.server";
import { encodeBase64TokenObject, processCookie, validateToken } from "./common.server";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { convertNumberSuffixToSecond } from "./common";

export class TokensUtility {


    // Auth Tokens Stuff
    static generateAuthTokens(payload: PreJWTPayload) {


        const accessToken = jwt.sign({
            _data: encodeBase64TokenObject(payload),
        }, JWT_ACCESS_SECRET, {
            algorithm: 'HS256',
            expiresIn: JWT_ACCESS_EXPIRES.toString()

        });

        const refreshToken = jwt.sign({
            _data: encodeBase64TokenObject(payload),
        }, JWT_REFRESH_SECRET, {

            algorithm: 'HS256',
            expiresIn: JWT_REFRESH_EXPIRES.toString()
        });



        return {
            accessToken,
            refreshToken
        } satisfies Tokens;

    }

    static async ensureAuthTokenCookie(cookies: Cookies, tokens: Tokens, provider: oAuthProviders, strict: boolean = true) {

        const cookieLoad = processCookie(tokens, provider);

        cookies.set(JWT_COOKIE_NAME, cookieLoad, {
            httpOnly: true,
            secure: MODE === "PROD" ? true : false,
            path: "/",

            sameSite: strict ? "strict" : "lax",
            maxAge: convertNumberSuffixToSecond(JWT_REFRESH_EXPIRES)
        });
    }


    // Device Token Stuff

    static getDeviceToken(cookies: Cookies) {
        return ServerSideCookieUtility.getCookie(cookies, DEVICE_TOKEN_COOKIE_NAME);
    }

    static getAuthToken(cookies: Cookies) {
        return ServerSideCookieUtility.getCookie(cookies, JWT_COOKIE_NAME);
    }

    static ensureDeviceTokenCookie(cookies: Cookies) {
        this.setDeviceToken(cookies, ulid())
    }

    static setDeviceToken(cookies: Cookies, token: string) {
        ServerSideCookieUtility.setCookie(cookies, DEVICE_TOKEN_COOKIE_NAME, token, {
            path: "/",
            maxAge: 31536e3, // 10 years
            httpOnly: true,
            sameSite: "strict",
        }
        );
    }

    static checkDeviceTokenValidity(cookies: Cookies) {
        const deviceToken = this.getDeviceToken(cookies);
        // TODO: Do additional checking here, like timestamp
        // && decodeTime(deviceToken) > Date.now()
        if (deviceToken && deviceToken.length === 26) {
            return true;
        }

        return false;

    }

    static deleteDeviceTokenCookie(cookies: Cookies) {
        cookies.delete(DEVICE_TOKEN_COOKIE_NAME, {
            path: "/"
        });
    }

    static deleteAuthTokenCookie(cookies: Cookies) {
        cookies.delete(JWT_COOKIE_NAME, {
            path: "/"
        });
    }

    static async checkAccessTokenValidity(token: string) {
        try {

            let accessV = await validateToken(token, JWT_ACCESS_SECRET);

            if (accessV.valid) {
                return {
                    id: accessV.data.id,
                    username: accessV.data.username,
                };
            }


        } catch (err) { console.log(err) };


        return null
    }

    static async checkRefreshTokenValidity(token: string) {

        try {

            let refreshV = await validateToken(token, JWT_REFRESH_SECRET);

            if (refreshV.valid) {
                return {
                    id: refreshV.data.id,
                    username: refreshV.data.username,
                };
            }

        } catch (err) {
            console.log(err);
        }

        return null;
    }


}