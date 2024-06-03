import bcrypt from 'bcrypt'
import { PrismaClient, Prisma } from '@prisma/client'
const prisma = new PrismaClient().$extends({
  query: {
    user: {
      async findFirst({ args, query }) {
        const user = await query(args)

        if(user && user.payDate){
          const payDate = user.payDate as Date;
          const next3dDays = new Date(payDate.getTime() + 2592000000) // 30d -> 30 * 24 * 60 * 60 * 1000
          const currentDate = new Date()
          if(currentDate > next3dDays){
            user.noCalls = 0
            user.payDate = currentDate
            await prisma.user.update({where: {id: user.id}, data: {payDate: currentDate, noCalls: 0}})
          }
        }

        return user
      },
      async findUnique({ args, query }) {
        const user = await query(args)

        if(user && user.payDate){
          const payDate = user.payDate as Date;
          const next3dDays = new Date(payDate.getTime() + 2592000000) // 30d -> 30 * 24 * 60 * 60 * 1000
          const currentDate = new Date()
          if(currentDate > next3dDays){
            user.noCalls = 0
            user.payDate = currentDate
            await prisma.user.update({where: {id: user.id}, data: {payDate: currentDate, noCalls: 0}})
          }
        }

        return user
      },
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

export default prisma
export { Prisma }