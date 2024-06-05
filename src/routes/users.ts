import { Hono } from "hono";
import { Variables } from "../variables";
import auth from "../middlewares/auth";
import { zValidator } from "@hono/zod-validator";
import { userSignupSchema, userUpdatenSchema } from "../schemas/userSchema";
import { createUser, deleteUserByEmail, deleteUserById, getAllUsers, getUserById, updatetUserByEmail, updatetUserById } from "../database/users";

const app = new Hono<{ Variables: Variables }>().basePath('/users');

const testing = process.env.NODE_ENV == 'test';

if(!testing) app.use(auth)

app.post('/', zValidator('json', userSignupSchema), async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const user = c.req.valid('json')

    const dbUser = await createUser(user)

    if('customError' in dbUser && 'status' in dbUser) return c.json({ message: dbUser.customError }, dbUser.status as any)

    return c.json(dbUser, 201)
})

app.get('/', async (c) => {

    if(c.get('role') === 'USER'){

        const id = c.get('id')!

        const user = await getUserById(id)

        if(user && 'customError' in user && 'status' in user) return c.json({ message: user.customError }, user.status as any)

        return c.json(user)
    }

    const { id, email } = c.req.query()

    const res = await getAllUsers({ id, email })

    if('customError' in res && 'status' in res) return c.json({ message: res.customError }, res.status as any)

    return c.json(res)
})

app.patch('/', zValidator('json', userUpdatenSchema), async (c) => {

    const user = c.req.valid('json')

    if(c.get('role') === 'USER'){
        const id = c.get('id')!

        const dbUser  = await updatetUserById(id, user)

        if('customError' in dbUser && 'status' in dbUser) return c.json({ message: dbUser.customError }, dbUser.status as any)

        let message = 'Good'

        if(c.get('role') !== dbUser.role) message = 'You need to generate new tokens'

        return c.json({ user: dbUser, message })
    }

    const { id, email } = c.req.query()

    let res

    if(id) res = await updatetUserById(id, user)
    else res = await updatetUserByEmail(email, user)

    if('customError' in res && 'status' in res) return c.json({ message: res.customError }, res.status as any)

    return c.json({ user: res, message: 'Good'})
})

app.delete('/', async (c) => {

    if(c.get('role') === 'USER'){
        const id = c.get('id')!

        const user = await deleteUserById(id)

        if('customError' in user && 'status' in user) return c.json({ message: user.customError }, user.status as any)

        return c.body(null, 204)
    }

    const { id, email } = c.req.query()

    if(!id && !email) return c.json({ message: 'You need to include the id query or the email query' }, 400)
        
    let res

    if(id) res = await deleteUserById(id)
    else res = await deleteUserByEmail(email)

    if('customError' in res && 'status' in res) return c.json({ message: res.customError }, res.status as any)

    return c.body(null, 204)
})

export default app