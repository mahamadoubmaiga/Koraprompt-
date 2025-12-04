import { neon, neonConfig } from '@neondatabase/serverless';

// Configuration de Neon
neonConfig.fetchConnectionCache = true;

// Créer une connexion SQL
const getDatabaseUrl = (): string => {
  // Try to use import.meta.env (Vite) first.
  // We use a safe access pattern.

  // @ts-ignore
  const viteEnv = typeof import.meta !== 'undefined' && import.meta.env;

  // Check for VITE_ prefixed variables which are exposed to the client by default in Vite
  const dbUrl = viteEnv ? (viteEnv.VITE_DATABASE_URL || viteEnv.VITE_NEON_DATABASE_URL) : undefined;

  // Also check non-prefixed if they happen to be replaced (e.g. if explicitly defined in vite config, though we avoid that for secrets)
  // or if running in a non-Vite environment where process.env works.
  let processUrl = '';
  try {
     // We access process.env properties directly so Vite can replace them at build time if configured,
     // or Node.js can read them at runtime.
     // However, since we define process.env = {} in vite.config, these might be undefined in browser unless defined in 'define'.
     processUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '';
  } catch (e) {
    // ignore
  }

  const url = dbUrl || processUrl;

  if (!url) {
    // Return empty string instead of throwing to prevent app crash on load if vars are missing.
    // NOTE: Connecting to the database directly from the client (browser) using a connection string
    // that contains credentials is NOT recommended for production apps due to security risks.
    // Use VITE_DATABASE_URL in .env only if you understand the risks.
    console.warn('DATABASE_URL, NEON_DATABASE_URL or VITE_DATABASE_URL environment variable is missing.');
    return '';
  }
  return url;
};

// Exporter la fonction SQL pour exécuter des requêtes
const dbUrl = getDatabaseUrl();
// If no URL, provide a dummy function that throws when CALLED, rather than crashing immediately on load.
export const sql = dbUrl ? neon(dbUrl) : async () => { throw new Error("Database not configured. DATABASE_URL is missing."); };

// Types pour les résultats de requêtes
export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
}

// Fonction utilitaire pour exécuter des requêtes
export async function query<T = Record<string, unknown>>(
  queryText: string,
  params?: unknown[]
): Promise<T[]> {
  try {
    // @ts-ignore
    const result = await sql(queryText, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Fonction pour vérifier la connexion à la base de données
export async function checkConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}
