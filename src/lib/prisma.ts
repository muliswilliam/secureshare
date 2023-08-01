import { PrismaClient } from '@prisma/client'

const prisma: PrismaClient = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

// if (process.env.NODE_ENV === 'production') {
//   prisma = new PrismaClient()
// } else {
//   if (!global.prisma) {
//     global.prisma = new PrismaClient()
//   }
//   prisma = global.prisma
// }

export default prisma
