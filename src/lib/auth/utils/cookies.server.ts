

import { MODE } from "$env/static/private";
import type { Cookies } from "@sveltejs/kit";
import type { CookieSerializeOptions } from "cookie";


export class ServerSideCookieUtility {

    static setCookie(cookies: Cookies, cookie_name: string, token: string, options: CookieSerializeOptions & { path: string; }) {

        cookies.set(cookie_name, token, {
            ...options,
            secure: MODE ?? "DEV" ? false : true
        });

    }

    static getCookie(cookies: Cookies, cookie_name: string) {
        return cookies.get(cookie_name);
    }

}