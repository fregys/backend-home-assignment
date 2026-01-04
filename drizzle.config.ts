import { defineConfig } from 'drizzle-kit';
import { CONFIG } from './src/config/config.js';

export default defineConfig({
    schema: './src/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: CONFIG.POSTGRES_URL,
    },
});