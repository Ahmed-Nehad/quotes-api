import { z } from 'zod'

const email = z.string({ required_error: 'email field is required', invalid_type_error: 'email field must be a string' }).email('This is not a valid email.');
const password = z.string({ required_error: 'name field is required', invalid_type_error: 'name field must be a string' }).min(6, { message: 'password field must be more than 5 characters' });

export const userSignupSchema = z.object({
    name: z.string({ required_error: 'name field is required', invalid_type_error: 'name field must be a string' }).min(3, { message: 'The name must be more than three letters'}),
    email,
    password,
    role: z.enum(['USER', 'ADMIN']).default('USER').optional()
});

export const userSigninSchema = z.object({
    email,
    password
})

export const userUpdatenSchema = z.object({
    name: z.string({ required_error: 'name field is required', invalid_type_error: 'name field must be a string' }).min(3, { message: 'The name must be more than three letters'}).optional(),
    email: email.optional(),
    password: password.optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    planId: z.string().optional(),
    payPeriod: z.enum(['MONTH', 'YEAR']).optional(),
    payDate: z.date().optional(),
    apiKey: z.string().optional(),
    noCalls: z.number().optional(),
    refreshToken: z.string().optional()
})

export type userSignupType = typeof userSignupSchema._type

export type userSigninType = typeof userSigninSchema._type