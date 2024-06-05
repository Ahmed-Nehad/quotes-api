import bcrypt from 'bcrypt'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      $allOperations({ args, query }) {
        return (async () => {
          try {
            return await query(args);
          } catch (error) {
            let customError, status
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              if (error.code === 'P2002') {
                customError = `${(error.meta!.target as string).split('_')[1]} already exist`;
                status = 409
              } else if (error.code === 'P2023') {
                customError = `Could't find any thing with this id`;
                status = 404
              } else {
                console.error(1, error)
                customError = `unknown Error`;
                status = 500
              }
            } else {
              console.error(2, error)
              customError = 'unknown Error'
              status = 500
            }
            return { customError, status }
          }
        })();
      }
    },
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