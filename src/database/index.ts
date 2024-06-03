import bcrypt from 'bcrypt'
import { PrismaClient, Prisma } from '@prisma/client'
const prisma = new PrismaClient().$extends({
  query: {
    user: {
      async create({ args, query }) {
        if (args.data.password) {
          args.data.password = await bcrypt.hash(args.data.password, 10);
        }
        return query(args);
      },
      async update({ args, query }) {
        if (args.data.password) {
          if (typeof args.data.password === 'string') {
              args.data.password = await bcrypt.hash(args.data.password, 10);
          } else if (args.data.password.set) {
              args.data.password.set = await bcrypt.hash(args.data.password.set, 10);
          }
        }
        return query(args);
      }
    }
  }
});

prisma.$extends

export default prisma
export { Prisma }