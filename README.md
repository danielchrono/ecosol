🌿 Ecosol - Plataforma de Economia Solidária

<<<<<<< HEAD
Plataforma voltada para a gestão e fomento da economia solidária, desenvolvida com Next.js 15, Prisma 7.2 e Supabase.
🚀 Começando
Pré-requisitos

    Node.js 18+

    npm, yarn, pnpm ou bun

    Conta no Supabase

    Git

Instalação

    Clone o repositório:
    bash

git clone https://github.com/seu-usuario/ecosol.git
cd ecosol

Instale as dependências:
bash

npm install

Configure as variáveis de ambiente:
bash

cp .env.example .env.local

    Edite o arquivo .env.local com suas credenciais do Supabase.

⚙️ Configuração do Ambiente
1. Variáveis de Ambiente (.env.local)
env

# URL para a aplicação (Porta 6543 - Transaction Mode com PgBouncer)
=======
Plataforma voltada para a gestão e fomento da economia solidária, desenvolvida com **Next.js 15**, **Prisma 7.2** e **Supabase**.

## 🚀 Começando

### Pré-requisitos
- Node.js 18+ e npm/yarn/pnpm/bun
- Conta no Supabase
- Git

### Instalação
1. Clone o repositório: `git clone https://github.com/seu-usuario/ecosol.git`
2. Acesse a pasta: `cd ecosol`
3. Instale as dependências: `npm install`
4. Configure as variáveis de ambiente: `cp .env.example .env.local`
5. Preencha o arquivo `.env.local` com suas credenciais

## ⚙️ Configuração do Ambiente
**Variáveis de Ambiente (.env.local):**

>>>>>>> d6cb455 (fix: otimização da responsividade do header para mobile (botões dinâmicos))
DATABASE_URL="postgresql://postgres.[ID]:[SENHA]@[HOST]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ID]:[SENHA]@[HOST]:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_chave_anon_aqui"
SUPABASE_SERVICE_ROLE_KEY="sua_chave_de_servico_aqui"
<<<<<<< HEAD

Importante: Codifique caracteres especiais na senha (exemplo: * deve ser escrito como %2A).
2. Configuração do Prisma 7.2

No Prisma 7.2, as URLs de conexão são gerenciadas exclusivamente pelo arquivo prisma.config.ts. Crie este arquivo na raiz do projeto:
typescript
=======
text

**Importante:** Codifique caracteres especiais na senha (ex: * → %2A)

**Configuração do Prisma 7.2:**
Crie o arquivo `prisma.config.ts` na raiz:
>>>>>>> d6cb455 (fix: otimização da responsividade do header para mobile (botões dinâmicos))

import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
dotenv.config();
export default defineConfig({
<<<<<<< HEAD
  datasource: {
    // O CLI utiliza esta URL para migrações (deve ser a DIRECT_URL porta 5432)
    url: process.env.DIRECT_URL as string,
  },
=======
datasource: {
url: process.env.DIRECT_URL as string,
},
>>>>>>> d6cb455 (fix: otimização da responsividade do header para mobile (botões dinâmicos))
});
text

<<<<<<< HEAD
3. Sincronização de Banco de Dados
bash
=======
>>>>>>> d6cb455 (fix: otimização da responsividade do header para mobile (botões dinâmicos))

**Configuração do Banco de Dados:**

npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
text

<<<<<<< HEAD
# Executar migrações iniciais (utiliza a url definida no config)
npx prisma migrate dev --name init

# Abrir Prisma Studio para visualização de dados
npx prisma studio

🔐 Configuração do Supabase Dashboard

Configurações necessárias no painel do Supabase para o funcionamento correto da plataforma:

    Redirect URLs:

        Acesse Authentication > URL Configuration

        Adicione http://localhost:3000/** e sua URL de produção

    Rota de Consentimento:

        Implementada em app/oauth/consent/page.tsx para gerenciar autorizações de login

    Storage:

        Crie um bucket público chamado logos

        Configure políticas de acesso conforme necessário

🏃 Executando o Projeto
Ambiente de Desenvolvimento
bash

npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev

Abra http://localhost:3000 no navegador para ver o resultado.
Build para Produção
bash

# Build do projeto
npm run build

# Iniciar servidor de produção
npm start

📁 Estrutura do Projeto
text

ecosol/
├── app/
│   ├── api/               # Rotas da API
│   ├── auth/              # Páginas de autenticação
│   ├── oauth/             # Fluxo OAuth (inclui consent)
│   └── page.tsx           # Página inicial
├── components/            # Componentes React reutilizáveis
├── lib/
│   ├── prisma.ts          # Cliente Prisma
│   └── supabase.ts        # Cliente Supabase
├── prisma/
│   └── schema.prisma      # Definição do modelo de dados
├── public/                # Arquivos estáticos
└── styles/                # Estilos globais

🛠 Tecnologias Utilizadas

    Next.js 15 - Framework React com App Router

    TypeScript - Tipagem estática

    Prisma 7.2 - ORM para banco de dados

    Supabase - Backend como serviço (Auth, DB, Storage)

    Tailwind CSS - Estilização

    React Hook Form - Manipulação de formulários

    Zod - Validação de schemas

🔧 Scripts Disponíveis

No package.json, os principais scripts são:
json

{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio"
}

🤝 Contribuindo

    Faça um fork do projeto

    Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)

    Commit suas mudanças (git commit -m 'Add some AmazingFeature')

    Push para a branch (git push origin feature/AmazingFeature)

    Abra um Pull Request

📄 Licença

Este projeto está sob licença MIT. Veja o arquivo LICENSE para mais detalhes.
📚 Aprenda Mais

Para aprender mais sobre Next.js, confira os seguintes recursos:

    Documentação Next.js - aprenda sobre features e API do Next.js

    Learn Next.js - um tutorial interativo de Next.js

Você também pode conferir o repositório GitHub do Next.js - seu feedback e contribuições são bem-vindos!
🚀 Deploy na Vercel

A forma mais fácil de fazer deploy do seu app Next.js é usando a Vercel Platform dos criadores do Next.js.

Confira nossa documentação de deployment do Next.js para mais detalhes.

Nota: Este projeto utiliza next/font para otimizar e carregar automaticamente a fonte Geist, uma nova família de fontes da Vercel.

Desenvolvido com ❤️ para a economia solidária.
=======

## 🔐 Configuração do Supabase
1. **Authentication:** No Dashboard do Supabase, vá em Authentication > URL Configuration e adicione:
   - `http://localhost:3000/**`
   - `https://seu-dominio.com/**` (para produção)
2. **Storage:** Crie um bucket público chamado `logos` e configure as permissões.

## 🏃 Executando o Projeto
**Ambiente de Desenvolvimento:** `npm run dev` e acesse http://localhost:3000
**Build para Produção:** `npm run build` e depois `npm start`

## 📁 Estrutura do Projeto

ecosol/
├── app/ # Diretório principal da aplicação Next.js
│ ├── api/ # Rotas da API
│ ├── auth/ # Páginas de autenticação
│ ├── oauth/ # Fluxo OAuth (inclui consent)
│ └── page.tsx # Página inicial
├── components/ # Componentes React reutilizáveis
├── lib/ # Utilities e configurações
│ ├── prisma.ts # Cliente Prisma
│ └── supabase.ts # Cliente Supabase
├── prisma/ # Schema do Prisma
│ └── schema.prisma # Definição do modelo de dados
├── public/ # Arquivos estáticos
└── styles/ # Estilos globais
text


## 🛠 Tecnologias Utilizadas
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Prisma 7.2** - ORM para banco de dados
- **Supabase** - Backend como serviço
- **Tailwind CSS** - Estilização
- **React Hook Form** - Manipulação de formulários
- **Zod** - Validação de schemas

## 🔧 Scripts Disponíveis
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia servidor de produção
- `npm run lint` - Executa linter
- `npx prisma generate` - Gera cliente Prisma
- `npx prisma migrate dev` - Executa migrações
- `npx prisma studio` - Abre interface do Prisma

## 🤝 Contribuindo
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença
Este projeto está sob licença MIT.

## 📚 Links Úteis
- [Documentação Next.js](https://nextjs.org/docs)
- [Tutorial Next.js](https://nextjs.org/learn)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)

## 🚀 Deploy na Vercel
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente na dashboard da Vercel
3. O deploy será automático a cada push

**Nota:** Este projeto utiliza `next/font` para otimizar e carregar automaticamente a fonte Geist.

---

Desenvolvido com ❤️ para a economia solidária.
>>>>>>> d6cb455 (fix: otimização da responsividade do header para mobile (botões dinâmicos))
