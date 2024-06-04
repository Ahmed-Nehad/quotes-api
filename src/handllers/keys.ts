import { Context, Env, Input } from "hono";

export const keyGenerator = (c: Context<Env, string, Input>) => {
    const ip = c.req.raw.headers.get('CF-Connecting-IP');

    return ip ?? "anonymous"
}