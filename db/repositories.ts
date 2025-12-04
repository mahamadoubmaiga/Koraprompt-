import { sql } from './connection';
import { User, Folder, Preset, SavedPrompt, PromptVersion } from '../types';

// ============================================
// User Repository
// ============================================

export async function createUser(email: string): Promise<User> {
  const result = await sql`
    INSERT INTO users (email)
    VALUES (${email})
    RETURNING id, email
  `;
  return { id: result[0].id, email: result[0].email };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email FROM users WHERE email = ${email}
  `;
  if (result.length === 0) return null;
  return { id: result[0].id, email: result[0].email };
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email FROM users WHERE id = ${id}::uuid
  `;
  if (result.length === 0) return null;
  return { id: result[0].id, email: result[0].email };
}

// ============================================
// Folder Repository
// ============================================

export async function createFolder(name: string, userId: string): Promise<Folder> {
  const result = await sql`
    INSERT INTO folders (name, user_id)
    VALUES (${name}, ${userId}::uuid)
    RETURNING id, name, user_id
  `;
  return { id: result[0].id, name: result[0].name, userId: result[0].user_id };
}

export async function getFoldersByUserId(userId: string): Promise<Folder[]> {
  const result = await sql`
    SELECT id, name, user_id FROM folders WHERE user_id = ${userId}::uuid ORDER BY created_at DESC
  `;
  return result.map(row => ({ id: row.id, name: row.name, userId: row.user_id }));
}

export async function deleteFolder(id: string): Promise<void> {
  await sql`DELETE FROM folders WHERE id = ${id}::uuid`;
}

export async function updateFolder(id: string, name: string): Promise<Folder> {
  const result = await sql`
    UPDATE folders SET name = ${name} WHERE id = ${id}::uuid RETURNING id, name, user_id
  `;
  return { id: result[0].id, name: result[0].name, userId: result[0].user_id };
}

// ============================================
// Preset Repository
// ============================================

export async function createPreset(
  name: string,
  userId: string,
  settings: Preset['settings']
): Promise<Preset> {
  const result = await sql`
    INSERT INTO presets (name, user_id, settings)
    VALUES (${name}, ${userId}::uuid, ${JSON.stringify(settings)}::jsonb)
    RETURNING id, name, user_id, settings
  `;
  return {
    id: result[0].id,
    name: result[0].name,
    userId: result[0].user_id,
    settings: result[0].settings
  };
}

export async function getPresetsByUserId(userId: string): Promise<Preset[]> {
  const result = await sql`
    SELECT id, name, user_id, settings FROM presets WHERE user_id = ${userId}::uuid ORDER BY created_at DESC
  `;
  return result.map(row => ({
    id: row.id,
    name: row.name,
    userId: row.user_id,
    settings: row.settings
  }));
}

export async function deletePreset(id: string): Promise<void> {
  await sql`DELETE FROM presets WHERE id = ${id}::uuid`;
}

// ============================================
// SavedPrompt Repository
// ============================================

export async function createSavedPrompt(prompt: Omit<SavedPrompt, 'id'>): Promise<SavedPrompt> {
  // Handle nullable UUID fields separately to avoid nested template literals
  const userId = prompt.userId || null;
  const folderId = prompt.folderId || null;
  
  let result;
  if (userId && folderId) {
    result = await sql`
      INSERT INTO saved_prompts (
        type, prompts, versions, generator, user_input, project_name,
        date, generated_image, user_id, folder_id, is_published
      )
      VALUES (
        ${prompt.type},
        ${prompt.prompts}::text[],
        ${JSON.stringify(prompt.versions)}::jsonb,
        ${prompt.generator},
        ${prompt.userInput},
        ${prompt.projectName},
        ${prompt.date}::timestamp,
        ${prompt.generatedImage || null},
        ${userId}::uuid,
        ${folderId}::uuid,
        ${prompt.isPublished}
      )
      RETURNING *
    `;
  } else if (userId) {
    result = await sql`
      INSERT INTO saved_prompts (
        type, prompts, versions, generator, user_input, project_name,
        date, generated_image, user_id, folder_id, is_published
      )
      VALUES (
        ${prompt.type},
        ${prompt.prompts}::text[],
        ${JSON.stringify(prompt.versions)}::jsonb,
        ${prompt.generator},
        ${prompt.userInput},
        ${prompt.projectName},
        ${prompt.date}::timestamp,
        ${prompt.generatedImage || null},
        ${userId}::uuid,
        NULL,
        ${prompt.isPublished}
      )
      RETURNING *
    `;
  } else if (folderId) {
    result = await sql`
      INSERT INTO saved_prompts (
        type, prompts, versions, generator, user_input, project_name,
        date, generated_image, user_id, folder_id, is_published
      )
      VALUES (
        ${prompt.type},
        ${prompt.prompts}::text[],
        ${JSON.stringify(prompt.versions)}::jsonb,
        ${prompt.generator},
        ${prompt.userInput},
        ${prompt.projectName},
        ${prompt.date}::timestamp,
        ${prompt.generatedImage || null},
        NULL,
        ${folderId}::uuid,
        ${prompt.isPublished}
      )
      RETURNING *
    `;
  } else {
    result = await sql`
      INSERT INTO saved_prompts (
        type, prompts, versions, generator, user_input, project_name,
        date, generated_image, user_id, folder_id, is_published
      )
      VALUES (
        ${prompt.type},
        ${prompt.prompts}::text[],
        ${JSON.stringify(prompt.versions)}::jsonb,
        ${prompt.generator},
        ${prompt.userInput},
        ${prompt.projectName},
        ${prompt.date}::timestamp,
        ${prompt.generatedImage || null},
        NULL,
        NULL,
        ${prompt.isPublished}
      )
      RETURNING *
    `;
  }
  return mapSavedPromptFromDb(result[0]);
}

export async function getSavedPromptsByUserId(userId: string): Promise<SavedPrompt[]> {
  const result = await sql`
    SELECT * FROM saved_prompts WHERE user_id = ${userId}::uuid ORDER BY date DESC
  `;
  return result.map(mapSavedPromptFromDb);
}

export async function getPublishedPrompts(): Promise<SavedPrompt[]> {
  const result = await sql`
    SELECT * FROM saved_prompts WHERE is_published = TRUE ORDER BY date DESC
  `;
  return result.map(mapSavedPromptFromDb);
}

export async function getSavedPromptById(id: string): Promise<SavedPrompt | null> {
  const result = await sql`
    SELECT * FROM saved_prompts WHERE id = ${id}::uuid
  `;
  if (result.length === 0) return null;
  return mapSavedPromptFromDb(result[0]);
}

export async function updateSavedPrompt(prompt: SavedPrompt): Promise<SavedPrompt> {
  // Handle nullable folder_id field separately to avoid nested template literals
  const folderId = prompt.folderId || null;
  
  let result;
  if (folderId) {
    result = await sql`
      UPDATE saved_prompts SET
        type = ${prompt.type},
        prompts = ${prompt.prompts}::text[],
        versions = ${JSON.stringify(prompt.versions)}::jsonb,
        generator = ${prompt.generator},
        user_input = ${prompt.userInput},
        project_name = ${prompt.projectName},
        generated_image = ${prompt.generatedImage || null},
        folder_id = ${folderId}::uuid,
        is_published = ${prompt.isPublished}
      WHERE id = ${prompt.id}::uuid
      RETURNING *
    `;
  } else {
    result = await sql`
      UPDATE saved_prompts SET
        type = ${prompt.type},
        prompts = ${prompt.prompts}::text[],
        versions = ${JSON.stringify(prompt.versions)}::jsonb,
        generator = ${prompt.generator},
        user_input = ${prompt.userInput},
        project_name = ${prompt.projectName},
        generated_image = ${prompt.generatedImage || null},
        folder_id = NULL,
        is_published = ${prompt.isPublished}
      WHERE id = ${prompt.id}::uuid
      RETURNING *
    `;
  }
  return mapSavedPromptFromDb(result[0]);
}

export async function deleteSavedPrompt(id: string): Promise<void> {
  await sql`DELETE FROM saved_prompts WHERE id = ${id}::uuid`;
}

// Helper function to map database row to SavedPrompt
function mapSavedPromptFromDb(row: Record<string, unknown>): SavedPrompt {
  return {
    id: row.id as string,
    type: row.type as SavedPrompt['type'],
    prompts: row.prompts as string[],
    versions: row.versions as PromptVersion[],
    generator: row.generator as string,
    userInput: row.user_input as string,
    projectName: row.project_name as string,
    date: row.date as string,
    generatedImage: row.generated_image as string | undefined,
    userId: row.user_id as string | null,
    folderId: row.folder_id as string | null,
    isPublished: row.is_published as boolean
  };
}
