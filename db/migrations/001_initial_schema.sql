-- Migration: 001_initial_schema.sql
-- Description: Création du schéma initial de la base de données Koraprompt
-- Date: 2024

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: users
-- Description: Table des utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- Table: folders
-- Description: Table des dossiers pour organiser les prompts
-- ============================================
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche par utilisateur
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);

-- ============================================
-- Table: presets
-- Description: Table des préréglages de génération
-- ============================================
CREATE TABLE IF NOT EXISTS presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche par utilisateur
CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets(user_id);

-- ============================================
-- Table: saved_prompts
-- Description: Table des prompts sauvegardés
-- ============================================
CREATE TABLE IF NOT EXISTS saved_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('video', 'image', 'audio')),
    prompts TEXT[] NOT NULL DEFAULT '{}',
    versions JSONB NOT NULL DEFAULT '[]',
    generator VARCHAR(100) NOT NULL,
    user_input TEXT NOT NULL DEFAULT '',
    project_name VARCHAR(255) NOT NULL DEFAULT 'Untitled',
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_image TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche par utilisateur
CREATE INDEX IF NOT EXISTS idx_saved_prompts_user_id ON saved_prompts(user_id);

-- Index pour recherche par dossier
CREATE INDEX IF NOT EXISTS idx_saved_prompts_folder_id ON saved_prompts(folder_id);

-- Index pour les prompts publiés
CREATE INDEX IF NOT EXISTS idx_saved_prompts_is_published ON saved_prompts(is_published) WHERE is_published = TRUE;

-- Index pour recherche par type
CREATE INDEX IF NOT EXISTS idx_saved_prompts_type ON saved_prompts(type);

-- Index pour tri par date
CREATE INDEX IF NOT EXISTS idx_saved_prompts_date ON saved_prompts(date DESC);

-- ============================================
-- Fonction: update_updated_at_column
-- Description: Met à jour automatiquement le champ updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at
    BEFORE UPDATE ON folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presets_updated_at
    BEFORE UPDATE ON presets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_prompts_updated_at
    BEFORE UPDATE ON saved_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: migrations
-- Description: Table pour suivre les migrations exécutées
-- ============================================
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enregistrer cette migration
INSERT INTO migrations (name) VALUES ('001_initial_schema') ON CONFLICT (name) DO NOTHING;
