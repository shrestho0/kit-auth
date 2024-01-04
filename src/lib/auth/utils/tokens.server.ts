import { DEVICE_TOKEN_COOKIE_NAME, JWT_ACCESS_EXPIRES, JWT_ACCESS_SECRET, JWT_COOKIE_NAME, JWT_REFRESH_EXPIRES, JWT_REFRESH_SECRET, MODE } from "$env/static/private";
import type { Cookies, RequestEvent } from "@sveltejs/kit";
import { ulid, decodeTime } from "ulid";
import { ServerSideCookieUtility } from "./cookies.server";
import { decodeBase64TokenObject, encodeBase64TokenObject } from "./common.server";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { convertNumberSuffixToSecond } from "./common";
import type { JWTPayload, JWTTokenObject, PreJWTPayloadObject, Tokens, oAuthProviders } from "../types";

export class TokensUtility {


    // Auth Tokens Stuff
    static generateAuthTokens(payload: PreJWTPayloadObject) {
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


    // Device Token Stuff

    static getDeviceTokenCookie(cookies: Cookies) {
        return ServerSideCookieUtility.getCookie(cookies, DEVICE_TOKEN_COOKIE_NAME);
    }
    /**
     * 
     * @param cookie 
     * @returns 
     */
    static validateDeviceTokenCookie(event: RequestEvent) {
        const dToken = ServerSideCookieUtility.getCookie(event.cookies, DEVICE_TOKEN_COOKIE_NAME)
        if (dToken && dToken.length === 26) {
            return dToken as String;
        }

        return null;
    }

    static getAuthToken(cookies: Cookies) {
        return ServerSideCookieUtility.getCookie(cookies, JWT_COOKIE_NAME);
    }

    static ensureDeviceTokenCookie(event: RequestEvent) {

        const dExists = this.validateDeviceTokenCookie(event);
        if (dExists) {
            event.locals.device_token = dExists as string;
            return;
        }


        const dt = ulid();
        event.locals.device_token = dt;
        this.setDeviceToken(event.cookies, dt,)
    }

    static async ensureAuthTokenCookie(cookies: Cookies, tokens: Tokens, provider: oAuthProviders, strict: boolean = true) {
        // console.log("ensureAuthTokenCookie", tokens, provider);
        const cookieLoad = this.processAuthTokens(tokens, provider);

        cookies.set(JWT_COOKIE_NAME, cookieLoad, {
            httpOnly: true,
            secure: MODE === "PROD" ? true : false,
            path: "/",

            sameSite: strict ? "strict" : "lax",
            maxAge: convertNumberSuffixToSecond(JWT_REFRESH_EXPIRES)
        });
    }

    static setDeviceToken(cookies: Cookies, token: string, strict: boolean = false) {
        ServerSideCookieUtility.setCookie(cookies, DEVICE_TOKEN_COOKIE_NAME, token, {
            path: "/",
            maxAge: 31536e3, // 10 years
            httpOnly: true,
            sameSite: strict ? "strict" : "lax",
        }
        );
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

    static checkDeviceTokenValidity(cookies: Cookies) {
        const deviceToken = this.getDeviceTokenCookie(cookies);
        // TODO: Do additional checking here, like timestamp
        // && decodeTime(deviceToken) > Date.now()
        if (deviceToken && deviceToken.length === 26) {
            return true;
        }

        return false;

    }

    static async checkJWTTokenValidity(token: string, ttype: "access" | "refresh") {
        try {

            let accessV = await this.validateAuthToken(token, ttype === "access" ? JWT_ACCESS_SECRET : ttype === "refresh" ? JWT_REFRESH_SECRET : "") as {
                valid: boolean;
                data: PreJWTPayloadObject;
                message?: string;
            };

            if (accessV.valid) {
                return {
                    id: accessV.data.id,
                    username: accessV.data.username,
                };
            }


        } catch (err) { console.log(err) };


        return null
    }



    static parseAuthTokensObject(payload: string): JWTTokenObject {
        try {
            const decodedJson: Object = decodeBase64TokenObject(payload);
            if (decodedJson.hasOwnProperty("access") && decodedJson.hasOwnProperty("refresh") && decodedJson.hasOwnProperty("provider")) {
                return {
                    ...decodedJson as JWTTokenObject
                }
            }

            throw new Error("Invalid Token Object");
        } catch (err) {
            return {
                access: null,
                refresh: null,
                provider: null
            } as JWTTokenObject;
        }
    }

    static parsePreJWTPayloadObject(payload: string) {
        return decodeBase64TokenObject(payload) as unknown as PreJWTPayloadObject;
    }

    static async validateAuthToken(token: string, secret: string) {
        try {

            const decoded: any = await jwt.decode(token);
            if (!decoded) {
                return { valid: false, message: "could not decode token" };
            }

            if (decoded.exp < Date.now() / 1000) {
                return { valid: false, message: "token expired" };
            }

            const result: JWTPayload = await jwt.verify(token, secret) as JWTPayload;
            return { valid: true, data: this.parsePreJWTPayloadObject(result._data) };
        } catch (err) {
            // console.log(err);
        }

        return { valid: false, data: null, message: "could not verify token" };
    }

    static processAuthTokens(tokens: Tokens, provider: oAuthProviders) {
        const { accessToken, refreshToken } = tokens;

        return encodeBase64TokenObject({
            access: accessToken,
            refresh: refreshToken,
            provider
        });

    }


}