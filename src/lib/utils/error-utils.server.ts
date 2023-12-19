import { fail } from "@sveltejs/kit";

export async function returnFailServerError() {
    return fail(500, {
        success: false,
        errors: [
            {
                path: ["server"],
                message: "Server error"
            }
        ]
    })
}

export async function returnFailClientError(code: CLIENT_ERROR_RESPONSE_CODES = 400, errors: any[], ...args: any[]) {
    return fail(400, {
        success: false,
        errors: errors,
        ...args
    })
}

export class RSAKeyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RSAKeyError";
    }
}