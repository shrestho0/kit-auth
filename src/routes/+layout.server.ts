import type { LayoutServerLoad } from "./$types";
import { UsersUtility } from "$auth/utils/db.server";

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
    if (locals.user_id && locals.user_username) {
        const userDetails = await UsersUtility.get(locals.user_id);
        const userEmails = await UsersUtility.getUserEmailsById(locals.user_id);
        return {
            user_id: locals.user_id,
            user_username: locals.user_username,
            user_data: userDetails,
            user_emails: userEmails
        }
    }

    // console.log("cookies", cookies.getAll());
};