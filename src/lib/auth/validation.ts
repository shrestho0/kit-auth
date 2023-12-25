
import { z } from "zod";

// Declare a schema
export const userRegisterSchema = z.object({
    username: z.string().min(5).max(255),
    email: z.string().email().max(255),
    password: z.string().min(8).max(64),
});

export const userLoginSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(64),
});