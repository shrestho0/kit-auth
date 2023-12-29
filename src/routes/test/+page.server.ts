import { LOGIN_COOKIE_VAL, REGISTER_COOKIE_VAL } from "$env/static/private";
import type { PageServerLoad } from "./$types";
import * as bcrypt from "bcrypt";

export const load: PageServerLoad = async ({ url, params, cookies, locals }) => {

    // // for register
    // const regc_val_r = REGISTER_COOKIE_VAL ?? "1";
    // const logc_val_r = ("NOT" + (LOGIN_COOKIE_VAL ?? "0"));

    // // for login 
    // const logc_val_l = LOGIN_COOKIE_VAL ?? "0";
    // const regc_val_l = ("NOT" + (REGISTER_COOKIE_VAL ?? "1"));

    // const bcryptSalt = await bcrypt.genSalt(1);

    // // for register
    // const regc_r_hash = await bcrypt.hash(regc_val_r, bcryptSalt);
    // const logc_r_hash = await bcrypt.hash(logc_val_r, bcryptSalt);
    // const comp_r = { regc_r: await bcrypt.compare(regc_val_r, regc_r_hash), logc_r: await bcrypt.compare(logc_val_r, logc_r_hash) };

    // console.log(comp_r, regc_val_r, logc_val_r, regc_r_hash, logc_r_hash);
    // // for login
    // const regc_l_hash = await bcrypt.hash(regc_val_l, bcryptSalt);
    // const logc_l_hash = await bcrypt.hash(logc_val_l, bcryptSalt);

    // const comp_l = { regc_l: await bcrypt.compare(regc_val_l, regc_l_hash), logc_l: await bcrypt.compare(logc_val_l, logc_l_hash) };
    // console.log(comp_l, regc_val_l, logc_val_l, regc_l_hash, logc_l_hash);






};