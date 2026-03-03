import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Definição do objeto global para persistência em desenvolvimento
interface CustomNodeJSGlobal {
  prisma: PrismaClient | undefined
  pgPool: Pool | undefined
}

const globalForPrisma = globalThis as unknown as CustomNodeJSGlobal

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL não configurada no .env.local')
}

// Inicialização Única do Pool (Visão de Engenharia)
if (!globalForPrisma.pgPool) {
  globalForPrisma.pgPool = new Pool({ 
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000 
  })
}

const adapter = new PrismaPg(globalForPrisma.pgPool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: ['error'] // Foca nos erros críticos de driver
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma