import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { RSAKeyError } from "$lib/utils/error-utils.server";
import { parseRVKeyAndGetTempUser } from "$lib/utils/auth-utils.server";


export const load: PageServerLoad = async ({ locals, url, cookies }) => {
    if (locals.user_id && locals.user_username) {
        return redirect(307, "/");
    }

    console.log("await confirmation for account creating");

    const rvkey = url.searchParams.get("rvkey");

    if (!rvkey) return redirect(307, "/");

    const dfCookie = cookies.get("_tf")


    try {


        const { provider, gUserData, userProviders, deviceFingerprint } = await parseRVKeyAndGetTempUser(rvkey as string, dfCookie as string);


        return {
            success: true,
            gUserData,
            userProviders,
            provider: provider,
        }

    } catch (e) {
        if (e instanceof RSAKeyError) {
            // return redirect(307, "/");
            return {
                success: false,
                message: e?.message ?? "Invalid request"
            }
        }
        console.log(e);
        return redirect(307, "/");
    }

}