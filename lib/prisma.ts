import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL não definida')
}

// Em desenvolvimento, o pooling as vezes causa 'Tenant not found' se o pool fechar incorretamente
const pool = new Pool({ 
  connectionString,
  max: 10, // Limite de conexões para não estourar o banco
  idleTimeoutMillis: 30000 
})
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: ['error'] // Remova 'query' para limpar o console e focar no erro real
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma