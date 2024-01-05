import { OauthActionHelper } from "$lib/auth/helpers/oauth.server";
import { AuthProvidersUtility, UserDeviceUtility } from "$lib/auth/utils/db.server";
import type { PageServerLoad } from "./$types";
import type { Actions } from "@sveltejs/kit";


export const load: PageServerLoad = async ({ locals }) => {
    if (!locals?.user_id) return;

    const UserOauthProviders = await AuthProvidersUtility.getByUserId(locals?.user_id);
    const UserDevices = await UserDeviceUtility.getWithUserId(locals?.user_id);

    return {
        UserOauthProviders,
        UserDevices
    }

};

export const actions: Actions = {
    // delete_device: UserDeviceUtility.handleDeleteDevice(),
    // delete_oauth: AuthProvidersUtility.handleDeleteOauth(),
    // add_device: UserDeviceUtility.handleAddDevice(),
    add_oauth: OauthActionHelper.handleAddOauthSubmission(),
};