/**
 * common utils for client and server 
 */

import { browser } from "$app/environment";

//@ts-ignore
import getBrowserFingerprint from 'get-browser-fingerprint';

export function convertNumberSuffixToSecond(str: string) {
    const suffixMap: {
        [key: string]: number
    } = {
        's': 1,
        'm': 60,
        'h': 3600,
        'd': 86400,
        'w': 604800,
        'M': 2592000,
        'y': 31536000,
    }
    const suffix = str[str.length - 1];
    const num = Number(str.slice(0, str.length - 1));
    if (isNaN(num)) {
        throw new Error("Invalid number");
    }
    if (!suffixMap[suffix]) {
        throw new Error("Invalid suffix");
    }
    return num * suffixMap[suffix];

}


export function toTitleCase(str: string) {
    if (str.length < 2) return str.toUpperCase();

    for (let i = 0; i < str.length; i++) {
        if (str[i] === " ") {
            str = str.slice(0, i) + str[i] + str[i + 1].toUpperCase() + str.slice(i + 2);
        }
    }
    return str[0].toUpperCase() + str.slice(1);
}

export function capitalizeFirstLetter(str: string) {
    if (str.length < 2) return str.toUpperCase();

    return str[0].toUpperCase() + str.slice(1);
}

export function generateRandomUserName() {
    if (!crypto) throw new Error("Crypto not supported");

    return crypto.randomUUID().split("-").join("");

}

export function setDeviceFingerprint() {
    if (!browser) return;
    const fingerprintCookieLifetime = 60 * 1e4; // 10 minute
    var tfCookieExpires = new Date(Date.now() + fingerprintCookieLifetime).toUTCString();

    const hexFingerprint = getBrowserFingerprint()?.toString(16);
    document.cookie = `_tf=${hexFingerprint};path=/;expires=${tfCookieExpires};SameSite=lax;`;
}
export function deleteDeviceFingerprint() {
    if (!browser) return;
    document.cookie = `_tf=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=lax;`;
}
