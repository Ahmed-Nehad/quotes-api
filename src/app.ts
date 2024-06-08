import { Hono } from 'hono'
import { logger } from 'hono/logger'
import authRoute from './routes/auth'
import quotesRoute from './routes/quotes'
import usersRoute from './routes/users'
import plansRoute from './routes/plans'
import subscriptionsRoute from './routes/subscriptions'
import categoriesRoute from './routes/categories'

const app = new Hono();

app.use(logger());

app.route('/', authRoute);

app.route('/v1', quotesRoute);
app.route('/v1', usersRoute);
app.route('/v1', plansRoute);
app.route('/v1', categoriesRoute);
app.route('/v1', subscriptionsRoute);

export default app;