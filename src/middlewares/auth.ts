import { verify} from 'hono/jwt'
import { getCookie, setCookie } from "hono/cookie";
import "dotenv/config";
import { createMiddleware } from 'hono/factory';
import { generateTokens, refreshTokenCookieOpt } from '../handllers/tokens';
import { getUserByEmail, updatetUserByEmail } from '../database/users';

export default createMiddleware(async (c, next) => {

    const auth = c.req.header('Authorization');

    if(!auth) return c.text('You are not authorized', 401);
    
    const token = auth.split(' ')[1];

    try{
        const decoded = await verify(token, process.env.TOKEN_SECRET!);

        if(!('email' in decoded)) return c.text("You need valid Tokens", 401);

        c.set('email', decoded.email as string);
    }catch{
        const refreshToken = getCookie(c, 'refreshToken');
        if(!refreshToken) return c.text("You need valid Tokens", 401);

        try {
            const decoded = await verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

            if(!('email' in decoded)) return c.text("You need valid Tokens", 401);

            const user = await getUserByEmail(decoded.email as string)

            if(!user || user.refreshToken !== refreshToken) return c.text("You need valid Tokens", 401);

            const { token, refreshToken: newRefreshToken } = await generateTokens(decoded.email as string);

            await updatetUserByEmail(decoded.email as string, {refreshToken: ''})

            setCookie(c, 'refreshToken', newRefreshToken, refreshTokenCookieOpt);

            c.header('X-Token', token);

        } catch { return c.text("You need valid Tokens", 401) } 
    }

    await next()
})
