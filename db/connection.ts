import { neon, neonConfig } from '@neondatabase/serverless';

// Configuration de Neon
neonConfig.fetchConnectionCache = true;

// Créer une connexion SQL
const getDatabaseUrl = (): string => {
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL or NEON_DATABASE_URL environment variable is required');
  }
  return url;
};

// Exporter la fonction SQL pour exécuter des requêtes
export const sql = neon(getDatabaseUrl());

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
