# 🌿 Ecosol - Plataforma de Economia Solidária

Plataforma voltada para a gestão e fomento da economia solidária entre autistas, desenvolvida com foco em alta performance, segurança de dados e escalabilidade. Este projeto integra o portfólio de um estudante de engenharia de computação no primeiro período do curso, com foco no aprimoramento da qualidade do código e otimização de sistemas.

Este é um projeto [Next.js](https://nextjs.org) iniciado com `create-next-app`.

## 🚀 Tecnologias e Ferramentas
* **Framework**: [Next.js 15 (App Router)](https://nextjs.org)
* **Linguagens**: TypeScript e JavaScript
* **ORM**: [Prisma 7.2](https://www.prisma.io)
* **Banco de Dados**: [Supabase (PostgreSQL)](https://supabase.com)
* **Estilização**: Tailwind CSS & Shadcn/UI

---

## 🛠️ Configuração do Backend (Prisma 7 + Supabase)

### 1. Variáveis de Ambiente (.env.local)
O uso do arquivo `.env.local` é essencial para evitar o vazamento de credenciais em repositórios públicos e gerenciar integrações de API de forma segura. Certifique-se de que sua senha do banco de dados tenha caracteres especiais codificados (Ex: `*` vira `%2A`, `@` vira `%40`).

```env
# URL para a aplicação (Porta 6543 - Transaction Mode com PgBouncer)
DATABASE_URL="postgresql://postgres.[ID]:[SENHA_CODIFICADA]@[aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true](https://aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true)"

# URL para Migrações e CLI (Porta 5432 - Session Mode Direto)
DIRECT_URL="postgresql://postgres:[SENHA_CODIFICADA]@db.[ID].supabase.co:5432/postgres"

# Supabase Keys
NEXT_PUBLIC_SUPABASE_URL="https://[ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_chave_anon_aqui"

2. Sincronização de Banco de Dados

Para refletir as alterações do schema no seu banco de dados Supabase e otimizar a performance, utilize os comandos abaixo:
Bash

# Gerar o Prisma Client
npx prisma generate

# Sincronizar esquema com o banco (utiliza a DIRECT_URL definida no ambiente)
npx prisma db push

🔐 Segurança e Infraestrutura (Database Patches)

Implementamos correções críticas para evitar a exposição de dados sensíveis e garantir a integridade da plataforma. Aplique os comandos abaixo no SQL Editor do Supabase:
1. Patch de Segurança: Blindagem de Dados (RLS)
SQL

-- 1. Ativação de Segurança de Nível de Linha (RLS)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de Acesso (Engenharia de Segurança)
CREATE POLICY "Serviços visíveis para todos" ON "Service" FOR SELECT USING (true);
CREATE POLICY "Usuários gerenciam seu próprio perfil" ON "User" USING (auth.uid()::text = id::text);
CREATE POLICY "Notificações privadas" ON "Notification" FOR SELECT USING (auth.uid()::text = "userId"::text);

-- 3. Otimização de Performance (Indexação)
-- Resolve o alerta "Unindexed foreign keys" e acelera buscas
CREATE INDEX IF NOT EXISTS "idx_notification_user_id" ON "Notification" ("userId");
CREATE INDEX IF NOT EXISTS "idx_service_category" ON "Service" ("category");

2. Configuração do Storage (Bucket logos)

Gerenciamento escalável de mídias para os serviços cadastrados:
SQL

-- 1. Criação do Bucket 'logos'
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- 2. Políticas de Storage
CREATE POLICY "Logos públicas" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Upload por usuários autenticados" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

⚙️ Getting Started (Desenvolvimento)

Instale as dependências e inicie o servidor local:
Bash

npm install
npm run dev

Abra http://localhost:3000 no seu navegador.
📈 Roadmap

    [x] RBAC (Role Based Access Control) para Admins e Usuários.

    [x] Sistema de notificações profissional com seleção múltipla.

    [x] Máscara dinâmica para campos de WhatsApp (RegEx).

    [x] Implementação de upload de imagens para o Bucket logos.

    [ ] Implementação de autenticação via Google.

Desenvolvido com foco em engenharia, performance e impacto social.