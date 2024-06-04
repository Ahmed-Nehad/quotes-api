import { sign } from "hono/jwt";
import "dotenv/config";

export const generateTokens = async  (email: string, role: 'ADMIN' | 'USER') => {
    const token = await sign({
        email,
        role,
        exp: Math.floor(Date.now() / 1000) + 60 * 0.5 // 0.5m
    }, process.env.TOKEN_SECRET!);
    
    const refreshToken = await sign({
        email,
        role,
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 //30d
    }, process.env.REFRESH_TOKEN_SECRET!);

    return { token, refreshToken }
}

export const refreshTokenCookieOpt = { 
    httpOnly: true, 
    maxAge: 30 * 24 * 60 * 60 // 30d
}