This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🌿 Ecosol - Plataforma de Economia Solidária

Plataforma voltada para a gestão e fomento da economia solidária, desenvolvida com **Next.js 15**, **Prisma 7.2** e **Supabase**.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

Open http://localhost:3000 with your browser to see the result.

You can start editing the page by modifying app/page.tsx. The page auto-updates as you edit the file.

This project uses next/font to automatically optimize and load Geist, a new font family for Vercel.
🛠 Configuração do Backend (Prisma 7 + Supabase)

No Prisma 7.2, as URLs de conexão não são mais suportadas no arquivo schema.prisma. Elas devem ser gerenciadas exclusivamente pelo arquivo prisma.config.ts.
1. Variáveis de Ambiente (.env)

Certifique-se de que sua senha do banco de dados tenha caracteres especiais codificados. Importante: O asterisco * deve ser escrito como %2A. Recomenda-se o uso do host IPv4 do Supabase para evitar travamentos de conexão no Linux.
Snippet de código

# URL para a aplicação (Porta 6543 - Transaction Mode com PgBouncer)
DATABASE_URL="postgresql://postgres.[ID]:[SENHA]@[HOST]:6543/postgres?pgbouncer=true"

# URL para Migrações e CLI (Porta 5432 - Session Mode Direto)
DIRECT_URL="postgresql://postgres.[ID]:[SENHA]@[HOST]:5432/postgres"

# Supabase Keys
NEXT_PUBLIC_SUPABASE_URL="https://[ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_chave_anon_aqui"

2. Configuração do Prisma CLI (prisma.config.ts)

Para que as migrações funcionem via terminal, o arquivo de configuração deve apontar para a DIRECT_URL. O Prisma 7 utiliza este arquivo para estabelecer a conexão durante o comando migrate.
TypeScript

import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  datasource: {
    // O CLI utiliza esta URL para migrações (deve ser a DIRECT_URL porta 5432)
    url: process.env.DIRECT_URL as string,
  },
});

3. Sincronização de Banco de Dados
Bash

# Gerar o Prisma Client
npx prisma generate

# Executar migrações iniciais (utiliza a url definida no config)
npx prisma migrate dev --name init

🔐 Autenticação e Storage (Supabase Dashboard)

Configurações necessárias no painel do Supabase para o funcionamento correto da plataforma:

    Redirect URLs: Adicione http://localhost:3000/** em Authentication > URL Configuration.

    Rota de Consentimento: Implementada em app/oauth/consent/page.tsx para gerenciar autorizações de login.

    Storage: Criar bucket público chamado logos.

Learn More

To learn more about Next.js, take a look at the following resources:

    Next.js Documentation - learn about Next.js features and API.

    Learn Next.js - an interactive Next.js tutorial.

You can check out the Next.js GitHub repository - your feedback and contributions are welcome!
Deploy on Vercel

The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.

Check out our Next.js deployment documentation for more details.