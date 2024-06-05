import test, { describe } from "node:test";
import app from "../../../app";
import assert from "node:assert";
import { userSignupType } from "../../../schemas/userSchema";
import { deleteUserByEmail } from "../../../database/users";

const randomNumber = Math.floor(Math.random() * 1000)
const testUser: userSignupType = {
    name: `exmaple${randomNumber}`,
    email: `exmaple${randomNumber}@email.com`,
    password: `password${randomNumber}`,
} as any

describe('auth routes test', () => {


    test('POST /sign-up', async () => {
        const res = await app.request('/sign-up', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(testUser)
        })

        
        const body = await res.json();
        const coookies = res.headers.getSetCookie();
        const refreshTokenCookie = coookies.filter(cookie => cookie.split('=')[0] === 'refreshToken')[0];
        
        assert.strictEqual(res.status, 201, `status code must be 201 not ${res.status}`);
        assert.ok('token' in body && typeof body['token'] === 'string', `couldn't find any valid token`);
        assert.ok('apiKey' in body && typeof body['apiKey'] === 'string', `couldn't find any valid apiKey`);
        assert.notStrictEqual(refreshTokenCookie, undefined, `couldn't any refresh token`);
    })

    test('POST /sign-in', async () => {
        const res = await app.request('/sign-in', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        })
    
        
        const body = await res.json();
        const coookies = res.headers.getSetCookie();
        const refreshTokenCookie = coookies.filter(cookie => cookie.split('=')[0] === 'refreshToken')[0];
        
        assert.strictEqual(res.status, 200, `status code must be 200 not ${res.status}`);
        assert.ok('token' in body && typeof body['token'] === 'string', `couldn't find any valid token`);
        assert.ok('apiKey' in body && typeof body['apiKey'] === 'string', `couldn't find any valid apiKey`);
        assert.notStrictEqual(refreshTokenCookie, undefined, `couldn't any refresh token`);
    })
    
    test('POST /sign-out', async () => {
        const res = await app.request('/sign-out', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        })
        
        assert.strictEqual(res.status, 204, `status code must be 204 not ${res.status}`);
    })
}).finally(async () => await deleteUserByEmail(testUser.email))


