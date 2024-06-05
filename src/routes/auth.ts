import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator'
import { userSigninSchema, userSignupSchema } from "../schemas/userSchema";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { Variables } from "../variables";
import "dotenv/config";
import { generateTokens, refreshTokenCookieOpt } from "../handllers/tokens";
import { createUser, getUserByEmail, getUserById, getUserByRefreshToken, updatetUserByEmail, updatetUserById } from "../database/users";
import bcrypt from 'bcrypt';
import { z } from "zod";
import { verify } from "hono/jwt";

const app = new Hono<{ Variables: Variables }>();

app.post('/sign-up', zValidator('json', userSignupSchema), async c => {

    const user = c.req.valid('json');
    
    let dbUser = await getUserByEmail(user.email)

    if(dbUser) return c.json({ message: 'User already exist' }, 409)
    
    dbUser = await createUser(user);
    
    const { token, refreshToken } = await generateTokens(dbUser.id, dbUser.role);
    
    dbUser = await updatetUserById(dbUser.id, { refreshToken })

    setCookie(c, 'refreshToken', refreshToken, refreshTokenCookieOpt);
    
    return c.json({ token, apiKey: dbUser.apiKey }, 201);
})

app.post('/sign-in', zValidator('json', userSigninSchema), async c => {

    const user = c.req.valid('json');

    let dbUser = await getUserByEmail(user.email)

    if(!dbUser) return c.json({ message: 'Invalid email or password' }, 401)

    const isSamePassword = await bcrypt.compare(user.password, dbUser.password)

    if(!isSamePassword) return c.json({ message: 'Invalid email or password' }, 401)

    const { token, refreshToken } = await generateTokens(dbUser.email, dbUser.role);
    
    await updatetUserById(dbUser.id, { refreshToken });

    setCookie(c, 'refreshToken', refreshToken, refreshTokenCookieOpt);
    
    return c.json({ token, apiKey: dbUser.apiKey });
})


app.post('/sign-out', zValidator('json', userSigninSchema), async (c, next) => {

    const refreshTokenCookie = getCookie(c, 'refreshToken')

    if(!refreshTokenCookie) return c.body(null, 204)
    
    const user = await getUserByRefreshToken(refreshTokenCookie)

    if(!user) return c.body(null, 204)

    await updatetUserByEmail(user.email, {refreshToken: ''})

    deleteCookie(c, 'refreshToken', refreshTokenCookieOpt)
    
    return c.body(null, 204)
})

app.post('/token', zValidator('json', z.object({ refreshToken: z.string() })),async (c) => {

    const { refreshToken } = c.req.valid('json')

    if(!refreshToken) return c.text("You need valid a refreshToken 1", 400);

    try {
        const decoded = await verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

        if(!('id' in decoded)) return c.json({ message: 'You need valid a refreshToken 2' }, 401)

        const user = await getUserById(decoded.id as string)

        if(!user || user.refreshToken !== refreshToken) return c.json({ message: 'You need valid a refreshToken 3' }, 401)

        const { token, refreshToken: newRefreshToken } = await generateTokens(user.id, user.role);

        await updatetUserById(user.id as string, { refreshToken: newRefreshToken })

        setCookie(c, 'refreshToken', newRefreshToken, refreshTokenCookieOpt);

        c.set('id', user.id);
        c.set('role', user.role);

        return c.json({ token })

    } catch { return c.json({ message: 'You need valid a refreshToken 4' }, 401) } 
})

export default app