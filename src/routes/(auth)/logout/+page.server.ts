import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { TokensUtility } from "$lib/auth/utils/tokens.server";



export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user_id && locals.user_username) {
        return redirect(307, "/login");
    }
    return redirect(307, "/");
};

export const actions: Actions = {
    default: async ({ request, locals, cookies }) => {
        if (locals.user_id && locals.user_username) {

            TokensUtility.deleteAuthTokenCookie(cookies);


            // TODO: Delete refresh token from db
            // TODO: Delete device token from db


            return redirect(307, "/login");
        }

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