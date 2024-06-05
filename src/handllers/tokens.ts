import { sign } from "hono/jwt";
import "dotenv/config";

export const generateTokens = async  (id: string, role: 'ADMIN' | 'USER') => {
    const token = await sign({
        id,
        role,
        exp: Math.floor(Date.now() / 1000) + 60 * 5 // 5m
    }, process.env.TOKEN_SECRET!);
    
    const refreshToken = await sign({
        id,
        role,
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 //30d
    }, process.env.REFRESH_TOKEN_SECRET!);

    return { token, refreshToken }
}

export const refreshTokenCookieOpt = { 
    httpOnly: true, 
    maxAge: 30 * 24 * 60 * 60 // 30d
}