import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    if (locals.user_id && locals.user_username) {
        return {
            user_id: locals.user_id,
            user_username: locals.user_username
        }
    }
};