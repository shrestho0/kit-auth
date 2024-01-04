import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";


export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals?.user_id || !locals?.user_username) return redirect(307, "/login");
}