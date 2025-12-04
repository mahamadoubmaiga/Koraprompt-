# Configuration de la Base de Données Neon

Ce document explique comment configurer et utiliser la base de données Neon pour Koraprompt.

## Prérequis

1. Un compte [Neon](https://neon.tech/)
2. Un projet Neon créé
3. Les secrets GitHub configurés

## Configuration des Secrets GitHub

Vous devez configurer les secrets suivants dans votre repository GitHub :

### Secrets requis

| Secret | Description |
|--------|-------------|
| `NEON_API_KEY` | Clé API Neon pour créer/supprimer des branches |
| `NEON_DATABASE_URL` | URL de connexion à la base de données principale |

### Variables requises

| Variable | Description |
|----------|-------------|
| `NEON_PROJECT_ID` | ID de votre projet Neon |

## Comment obtenir ces valeurs

### 1. NEON_API_KEY
1. Allez sur [console.neon.tech](https://console.neon.tech/)
2. Cliquez sur votre photo de profil > "Account settings"
3. Dans la section "API Keys", créez une nouvelle clé

### 2. NEON_DATABASE_URL
1. Allez sur votre projet dans la console Neon
2. Dans l'onglet "Connection Details"
3. Copiez la "Connection string" (format: `postgresql://user:password@host/database`)

### 3. NEON_PROJECT_ID
1. L'ID du projet se trouve dans l'URL de votre projet Neon
2. Exemple: `https://console.neon.tech/app/projects/abc123xyz` -> ID = `abc123xyz`

## Configurer les secrets dans GitHub

1. Allez dans votre repository GitHub
2. Cliquez sur "Settings" > "Secrets and variables" > "Actions"
3. Ajoutez les secrets et variables listés ci-dessus

## Workflows GitHub Actions

### 1. db-migrate.yml

Ce workflow exécute les migrations de base de données :

- **Déclencheur automatique** : Push sur `main` avec modifications dans `db/migrations/`
- **Déclencheur manuel** : Via "Actions" > "Database Migrations" > "Run workflow"

### 2. neon-branch.yml

Ce workflow gère les branches Neon pour les pull requests :

- Crée une branche Neon pour chaque PR ouverte
- Supprime la branche quand la PR est fermée
- Permet de tester les migrations sur une copie de la base

## Exécuter les migrations manuellement

### Via GitHub Actions

1. Allez dans "Actions" de votre repository
2. Sélectionnez "Database Migrations"
3. Cliquez sur "Run workflow"
4. Optionnel: spécifiez un fichier de migration spécifique

### En local

```bash
# Installer psql si nécessaire
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client

# Exécuter une migration
psql "$DATABASE_URL" -f db/migrations/001_initial_schema.sql
```

## Schéma de la Base de Données

### Tables

#### users
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| email | VARCHAR(255) | Email de l'utilisateur |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de mise à jour |

#### folders
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| name | VARCHAR(255) | Nom du dossier |
| user_id | UUID | Référence à users.id |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de mise à jour |

#### presets
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| name | VARCHAR(255) | Nom du preset |
| user_id | UUID | Référence à users.id |
| settings | JSONB | Configuration du preset |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de mise à jour |

#### saved_prompts
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| type | VARCHAR(50) | Type: video, image, audio |
| prompts | TEXT[] | Liste des prompts |
| versions | JSONB | Historique des versions |
| generator | VARCHAR(100) | Générateur AI utilisé |
| user_input | TEXT | Entrée utilisateur originale |
| project_name | VARCHAR(255) | Nom du projet |
| date | TIMESTAMP | Date de création |
| generated_image | TEXT | Image générée (base64) |
| user_id | UUID | Référence à users.id |
| folder_id | UUID | Référence à folders.id |
| is_published | BOOLEAN | Statut de publication |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de mise à jour |

## Utilisation dans le code

```typescript
import { 
  createUser, 
  getUserByEmail,
  createSavedPrompt,
  getSavedPromptsByUserId 
} from './db';

// Créer un utilisateur
const user = await createUser('user@example.com');

// Récupérer un utilisateur
const existingUser = await getUserByEmail('user@example.com');

// Créer un prompt
const prompt = await createSavedPrompt({
  type: 'image',
  prompts: ['A beautiful sunset...'],
  versions: [],
  generator: 'midjourney',
  userInput: 'sunset',
  projectName: 'Sunset Project',
  date: new Date().toISOString(),
  userId: user.id,
  folderId: null,
  isPublished: false
});

// Récupérer les prompts d'un utilisateur
const prompts = await getSavedPromptsByUserId(user.id);
```

## Dépannage

### Erreur de connexion
- Vérifiez que `NEON_DATABASE_URL` est correctement configuré
- Assurez-vous que votre IP n'est pas bloquée par Neon

### Migration échoue
- Vérifiez les logs dans GitHub Actions
- Assurez-vous que la syntaxe SQL est correcte
- Vérifiez que les migrations précédentes ont été exécutées

### Problème de permissions
- Vérifiez que le user de la base a les droits nécessaires
- Dans Neon, le user par défaut devrait avoir tous les droits
