import { AuthProvidersUtility, UserDeviceUtility } from "$lib/auth/utils/db.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals?.user_id) return;

    const UserOauthProviders = await AuthProvidersUtility.getByUserId(locals?.user_id);
    const UserDevices = await UserDeviceUtility.getWithUserId(locals?.user_id);

    return {
        UserOauthProviders,
        UserDevices
    }

};