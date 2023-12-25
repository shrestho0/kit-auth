
import { JWT_ACCESS_EXPIRES, JWT_ACCESS_SECRET, JWT_COOKIE_NAME, JWT_REFRESH_EXPIRES, JWT_REFRESH_SECRET, MODE } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { convertNumberSuffixToSecond } from './common';
import type { GoogleApis } from 'googleapis';



export async function resultOrNull(callback: () => any, outputError: boolean = true) {
    try {
        return await callback();
    }
    catch (err) {
        if (outputError) console.log(err);

        return null;
    }
}


// hash password
export async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

// compare password

export async function comparePassword(password: string, encryptedPassword: string) {
    const isMatch = await bcrypt.compare(password, encryptedPassword);
    return isMatch;
}

// jwt 

export function encodeBase64TokenObject(payload: any) {
    return Buffer.from(JSON.stringify(payload), "utf-8").toString('base64');
}

export function decodeBase64TokenObject(payload: any) {
    return JSON.parse(Buffer.from(payload, "base64").toString("utf-8"))
}


export async function generateAuthTokens(payload: PreJWTPayload) {


    // console.log("Generating accessToken");

    // console.log("JWT_ACCESS_EXPIRES", JWT_ACCESS_EXPIRES);

    const accessToken = await jwt.sign({
        _data: encodeBase64TokenObject(payload),
    }, JWT_ACCESS_SECRET, {
        algorithm: 'HS256',
        // expiresIn: JWT_ACCESS_EXPIRES,
        expiresIn: JWT_ACCESS_EXPIRES.toString()

    });
    const refreshToken = await jwt.sign({
        _data: encodeBase64TokenObject(payload),
    }, JWT_REFRESH_SECRET, {

        algorithm: 'HS256',
        // expiresIn: JWT_REFRESH_EXPIRES,
        expiresIn: JWT_REFRESH_EXPIRES.toString()
    });

    // console.log("Generated accessToken", accessToken);
    // console.log("Generated refreshToken", refreshToken);



    return {
        accessToken,
        refreshToken
    } satisfies Tokens;

}

// in TokensUtility
// export async function validateToken(token: string, secret: string) {
//     try {
//         // decode
//         // check if valid

//         const decoded: any = await jwt.decode(token);
//         if (!decoded) {
//             return { valid: false, message: "could not decode token" };
//         }

//         if (decoded.exp < Date.now() / 1000) {
//             return { valid: false, message: "token expired" };
//         }

//         const result: JWTPayload = await jwt.verify(token, secret) as JWTPayload;
//         return { valid: true, data: decodeBase64TokenObject(result._data) };
//     } catch (err) {
//         // console.log(err);
//     }

//     return { valid: false, message: "could not verify token" };
// }
//     try {
//         const decoded = await jwt.verify(token, JWT_ACCESS_SECRET);
//         return decoded;
//     } catch (err) {
//         console.log(err);
//         return null;
//     }

// }

// export function processCookie(tokens: Tokens, provider: oAuthProviders) {
//     const { accessToken, refreshToken } = tokens;

//     return encodeBase64TokenObject({
//         access: accessToken,
//         refresh: refreshToken,
//         provider
//     });

// }


// export async function setAuthCookies(cookies: Cookies, tokens: Tokens, provider: oAuthProviders, strict: boolean = true) {

//     const cookieLoad = processCookie(tokens, provider);

//     cookies.set(JWT_COOKIE_NAME, cookieLoad, {
//         httpOnly: true,
//         secure: MODE === "PROD" ? true : false,
//         path: "/",

//         sameSite: strict ? "strict" : "lax",
//         maxAge: convertNumberSuffixToSecond(JWT_REFRESH_EXPIRES)
//     });
// }

// cookies cookie hoye jabe
export async function deleteAuthCookies(cookies: Cookies) {
    cookies.delete(JWT_COOKIE_NAME, {
        path: "/"
    });

}

export async function getDataFromAuthCookies(cookies: Cookies) {
    const cookieLoad = cookies.get(JWT_COOKIE_NAME);
    if (cookieLoad) {
        const decodedCookie = decodeBase64TokenObject(cookieLoad);
        return decodedCookie;
    }
    return null;
}

export async function pasrseUserDataFromGoogleIdToken(token: string) {
    const userData: GoogleIdTokenPayload = jwt.decode(token) as GoogleIdTokenPayload;

    return userData;
}