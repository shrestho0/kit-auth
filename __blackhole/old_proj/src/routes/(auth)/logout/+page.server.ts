import { JWT_COOKIE_NAME } from "$env/static/private";
import { returnFailClientError } from "$lib/utils/error-utils.server";
import { deleteAuthCookies } from "$lib/utils/utils.server";
import { fail, json, redirect, type Actions, type RequestHandler } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { RefreshTokenUtility } from "$lib/utils/auth-utils.server";


export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user_id && locals.user_username) {
        return redirect(307, "/login");
    }
    return redirect(307, "/");
};

export const actions: Actions = {
    default: async ({ request, locals, cookies }) => {
        if (locals.user_id && locals.user_username) {
            deleteAuthCookies(cookies);
            // await RefreshTokenUtility.de
            // delete cookie in database

            // locals.user_id = null;
            // locals.user_username = null;
            return redirect(307, "/login");
        }
        return redirect(307, "/404");


    }
};

// export const POST: RequestHandler = async ({ request, locals, cookies }) => {
//     if (locals.user_id && locals.user_username) {

//         // get users auth providers

//         deleteAuthCookies(cookies);

//         return json({
//             success: true,
//             message: "Logged out successfully! not actually!"
//         }, {
//             status: 200
//         })
//     } else {
//         return json({
//             success: false,
//             message: "Not logged in"
//         }, {
//             status: 401,
//         })
//     }
// };