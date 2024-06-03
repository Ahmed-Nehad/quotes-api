import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator'
import { userSigninSchema, userSignupSchema } from "../schemas/userSchema";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { Variables } from "../variables";
import "dotenv/config";
import { generateTokens, refreshTokenCookieOpt } from "../handllers/tokens";
import { createUser, deleteUserById, getUserByEmail, getUserByRefreshToken, updatetUserByEmail, updatetUserById } from "../database/users";
import bcrypt from 'bcrypt';

const app = new Hono<{ Variables: Variables }>();

const testing = process.env.NODE_ENV == 'test';

app.post('/sign-up', zValidator('json', userSignupSchema), async c => {

    const user = c.req.valid('json');
    
    let dbUser = await getUserByEmail(user.email)

    if(dbUser) return c.json({ message: 'User already exist' }, 409)
    
    const { token, refreshToken } = await generateTokens(user.email);
    
    dbUser = await createUser(user, refreshToken);

    setCookie(c, 'refreshToken', refreshToken, refreshTokenCookieOpt);
    
    return c.json({ token }, 201);
})

app.post('/sign-in', zValidator('json', userSigninSchema), async c => {

    const user = c.req.valid('json');

    let dbUser = await getUserByEmail(user.email)

    if(!dbUser) return c.json({ message: 'Invalid email or password' }, 401)

    const isSamePassword = await bcrypt.compare(user.password, dbUser.password)

    if(!isSamePassword) return c.json({ message: 'Invalid email or password' }, 401)

    const { token, refreshToken } = await generateTokens(user.email);
    
    await updatetUserByEmail(user.email, { refreshToken });

    setCookie(c, 'refreshToken', refreshToken, refreshTokenCookieOpt);
    
    return c.json({ token });
})


app.post('/sign-out', zValidator('json', userSigninSchema), async (c, next) => {

    const refreshTokenCookie = getCookie(c, 'refreshToken')

    if(!refreshTokenCookie) return c.body(null, 204)

    const user = await getUserByRefreshToken(refreshTokenCookie)

    if(!user) return c.body(null, 204)

    await updatetUserById(user.id, {refreshToken: ''})

    if(testing) await deleteUserById(user.id)

    deleteCookie(c, 'refreshToken', refreshTokenCookieOpt)
    
    return c.body(null, 204)
})

export default app