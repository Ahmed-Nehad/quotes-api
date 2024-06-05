import { verify} from 'hono/jwt'
import "dotenv/config";
import { createMiddleware } from 'hono/factory';

export default createMiddleware(async (c, next) => {

    const auth = c.req.header('Authorization');

    if(!auth) return c.text('You are not authorized', 401);
    
    const token = auth.split(' ')[1];

    try{
        const decoded = await verify(token, process.env.TOKEN_SECRET!);

        if(!('id' in decoded)) return c.text("You need valid a token", 401);

        c.set('id', decoded.id as string);
        c.set('role', decoded.role as string);
    } catch {
        return c.json({ message: 'You need valid a token' }, 401)
    }

    await next()
})
