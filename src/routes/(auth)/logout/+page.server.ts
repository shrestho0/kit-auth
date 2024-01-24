import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { TokensUtility } from "$lib/auth/utils/tokens.server";
import { RefreshTokenUtility } from "$lib/auth/utils/db.server";



export const load: PageServerLoad = async ({ locals }) => {
    return redirect(307, "/");
};

// export const actions: Actions = {
//     default: async ({ request, locals, cookies }) => {
//         if (locals.user_id && locals.user_username) {

//             const tokens = TokensUtility.getAuthToken(cookies) as string;
//             const { refresh } = TokensUtility.parseAuthTokensObject(tokens);
//             if (refresh) {
//                 const refreshT = await TokensUtility.checkJWTTokenValidity(refresh, "refresh");
//                 const deletedDevice$ = await RefreshTokenUtility.deleteByToken(refresh);
//                 console.log("deleted refresh token from db", deletedDevice$?.hasOwnProperty("refreshToken"));

//             } else {

//             }


//             const deleted$ = TokensUtility.deleteAuthTokenCookie(cookies);
//             console.log("deleted auth token cookie", deleted$);

//             return redirect(307, "/login");
//         }

//     }
// };
