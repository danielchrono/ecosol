import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Engenharia de Robustez: Tenta ler o .env.local primeiro, depois o .env
dotenv.config({ path: '.env.local' }); 
dotenv.config(); 

export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL as string,
  },
});