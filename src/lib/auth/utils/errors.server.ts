import { fail } from "@sveltejs/kit";
import type { SERVER_ERROR_RESPONSE_CODES, CLIENT_ERROR_RESPONSE_CODES } from "$auth/types";

export async function returnFailServerError(code: SERVER_ERROR_RESPONSE_CODES = 500, ...args: any[]) {
    return fail(500, {
        success: false,
        ...args
    })
}

export async function returnFailClientError(code: CLIENT_ERROR_RESPONSE_CODES = 400, errors: any, ...args: any[]) {
    return fail(400, {
        success: false,
        errors,
        ...args
    })
}

export class RSAKeyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RSAKeyError";
    }
}