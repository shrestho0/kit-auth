

import type { Cookies } from "@sveltejs/kit";
import type { CookieSerializeOptions } from "cookie";

import * as bcrypt from "bcrypt";
import { MODE, LOGIN_COOKIE_NAME, LOGIN_COOKIE_VAL, REGISTER_COOKIE_NAME, REGISTER_COOKIE_VAL } from "$env/static/private";

export class ServerSideCookieUtility {

    static LP_VALS = {
        "LC": LOGIN_COOKIE_VAL,
        "RC": "NOT" + REGISTER_COOKIE_VAL
    }
    static RP_VALS = {
        "LC": "NOT" + LOGIN_COOKIE_VAL,
        "RC": REGISTER_COOKIE_VAL
    }


    static setCookie(cookies: Cookies, cookie_name: string, token: string, options: CookieSerializeOptions & { path: string; }) {

        cookies.set(cookie_name, token, {
            ...options,
            secure: MODE ?? "DEV" ? false : true,
            priority: "high",
            httpOnly: true,
        });

    }

    static getCookie(cookies: Cookies, cookie_name: string) {
        return cookies.get(cookie_name);
    }



    private static getAuthPageCookies(cookies: Cookies) {
        return {
            login: this.getCookie(cookies, LOGIN_COOKIE_NAME),
            register: this.getCookie(cookies, REGISTER_COOKIE_NAME)
        }
    }
    static async parseAuthPageRequestedFrom(cookies: Cookies): Promise<"login" | "register" | undefined> {
        const { login, register } = this.getAuthPageCookies(cookies);

        try {

            const LP_LC = await bcrypt.compare(this.LP_VALS["LC"], login ?? "");
            const LP_RC = await bcrypt.compare(this.LP_VALS["RC"], register ?? "");

            const RP_LC = await bcrypt.compare(this.RP_VALS["LC"], login ?? "");
            const RP_RC = await bcrypt.compare(this.RP_VALS["RC"], register ?? "");


            if (LP_LC && LP_RC) return "login";
            if (RP_LC && RP_RC) return "register";

        } catch (err) {
            return undefined;
        }

    }


    static async ensureLoginPageCookieAsync(cookies: Cookies) {
        // generate
        const LP_Salt = await bcrypt.genSalt(1);
        const LP_LC = await bcrypt.hash(this.LP_VALS["LC"], LP_Salt);
        const LP_RC = await bcrypt.hash(this.LP_VALS["RC"], LP_Salt);

        this.setCookie(cookies, LOGIN_COOKIE_NAME, LP_LC, { path: "/", sameSite: "lax", })
        this.setCookie(cookies, REGISTER_COOKIE_NAME, LP_RC, { path: "/", sameSite: "lax", })
    }

    static async ensureRegisterPageCookieAsync(cookies: Cookies) {
        const RP_Salt = await bcrypt.genSalt(1);
        const RP_LC = await bcrypt.hash(this.RP_VALS["LC"], RP_Salt);
        const RP_RC = await bcrypt.hash(this.RP_VALS["RC"], RP_Salt);

        this.setCookie(cookies, LOGIN_COOKIE_NAME, RP_LC, { path: "/", sameSite: "lax", })
        this.setCookie(cookies, REGISTER_COOKIE_NAME, RP_RC, { path: "/", sameSite: "lax", })
    }

    static async ensureNoAuthPageCookie(cookies: Cookies) {
        cookies.delete(LOGIN_COOKIE_NAME, { path: "/" });
        cookies.delete(REGISTER_COOKIE_NAME, { path: "/" });
    }


}