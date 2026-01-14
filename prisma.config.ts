import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Se o arquivo for .env.local, você precisa passar o path exato
dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});