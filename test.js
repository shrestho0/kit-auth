// import { LOGIN_COOKIE_VAL, REGISTER_COOKIE_VAL } from '$env/static/private';

// import * as bcrypt from 'bcrypt';


// const kList = []

// console.log(bcrypt)

import * as bcrypt from 'bcrypt';


const [LOGIN_COOKIE_VAL, REGISTER_COOKIE_VAL] = [process.env.LOGIN_COOKIE_VAL, process.env.REGISTER_COOKIE_VAL];

const LP_VALS = {
    "LC": LOGIN_COOKIE_VAL,
    "RC": "NOT" + REGISTER_COOKIE_VAL
}
const RP_VALS = {
    "LC": "NOT" + LOGIN_COOKIE_VAL,
    "RC": REGISTER_COOKIE_VAL
}


// for login


/**
 * LP->Login Page
 * RP->Register Page
 * LC->Login Cookie
 * RC->Register Cookie
 * 
 */

// if (LOGIN_COOKIE_VAL === undefined || REGISTER_COOKIE_VAL === undefined) {
//     console.log("Please set the environment variables LOGIN_COOKIE_VAL and REGISTER_COOKIE_VAL")
//     process.exit(1)
// }

const LP_Salt = await bcrypt.genSalt(1);
const LP_LC = await bcrypt.hash(LP_VALS["LC"], LP_Salt);
const LP_RC = await bcrypt.hash(LP_VALS["RC"], LP_Salt);

const RP_Salt = await bcrypt.genSalt(1);
const RP_LC = await bcrypt.hash(RP_VALS["LC"], RP_Salt);
const RP_RC = await bcrypt.hash(RP_VALS["RC"], RP_Salt);

const tests = [
    {
        "T": LP_LC,
        "Result": await bcrypt.compare(LP_VALS["LC"], LP_LC),
    },
    {

        "T": LP_RC,
        "Result": await bcrypt.compare(LP_VALS["RC"], LP_RC),
    },
    {

        "T": RP_LC,
        "Result": await bcrypt.compare(RP_VALS["LC"], RP_LC),
    },
    {

        "T": RP_RC,
        "Result": await bcrypt.compare(RP_VALS["RC"], RP_RC),
    }
]
console.log("Salts: ", LP_Salt, RP_Salt)

tests.forEach((test) => {
    console.log(test)
})

