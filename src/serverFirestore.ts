import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load firebase-applet-config.json
let config: any = {};
try {
  const possiblePaths = [
    path.resolve(process.cwd(), 'firebase-applet-config.json'),
    path.resolve(__dirname, '..', 'firebase-applet-config.json'),
    path.resolve(__dirname, 'firebase-applet-config.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      config = JSON.parse(fs.readFileSync(p, 'utf-8'));
      break;
    }
  }
} catch (err) {
  console.error('[Firestore] Failed to parse firebase-applet-config.json:', err);
}

const PROJECT_ID = config.projectId || 'gen-lang-client-0443279078';
const DATABASE_ID = config.firestoreDatabaseId || 'ai-studio-neofluxo-07841b20-b8cc-4e94-beca-742d96807593';
const API_KEY = config.apiKey || '';

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

/**
 * Converte valor JavaScript para formato Firestore REST Value
 */
export function toFirestoreValue(val: any): any {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (typeof val === 'boolean') {
    return { booleanValue: val };
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      return { integerValue: String(val) };
    }
    return { doubleValue: val };
  }
  if (typeof val === 'string') {
    return { stringValue: val };
  }
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map((item) => toFirestoreValue(item)),
      },
    };
  }
  if (typeof val === 'object') {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

/**
 * Converte formato Firestore REST Value para valor JavaScript nativo
 */
export function fromFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return val;

  if ('nullValue' in val) return null;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('stringValue' in val) return val.stringValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    const values = val.arrayValue.values || [];
    return values.map((v: any) => fromFirestoreValue(v));
  }
  if ('mapValue' in val) {
    const fields = val.mapValue.fields || {};
    const obj: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      obj[k] = fromFirestoreValue(v);
    }
    return obj;
  }
  return null;
}

/**
 * Converte documento Firestore REST em objeto JS com id
 */
export function parseFirestoreDoc(doc: any): any {
  if (!doc || !doc.fields) return null;
  const obj: Record<string, any> = {};
  for (const [k, v] of Object.entries(doc.fields)) {
    obj[k] = fromFirestoreValue(v);
  }
  const idFromPath = doc.name ? doc.name.split('/').pop() : undefined;
  if (idFromPath && !obj.id) {
    obj.id = idFromPath;
  }
  return obj;
}

/**
 * Salva ou atualiza um documento no Cloud Firestore
 */
export async function setFirestoreDocument(collection: string, docId: string, data: any): Promise<boolean> {
  if (!API_KEY) {
    console.warn('[Firestore] API key not found, skipping cloud persistence');
    return false;
  }

  const url = `${BASE_URL}/${encodeURIComponent(collection)}/${encodeURIComponent(docId)}?key=${API_KEY}`;
  const fields: Record<string, any> = {};

  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) {
      fields[k] = toFirestoreValue(v);
    }
  }

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[Firestore] Failed to save ${collection}/${docId} (${res.status}):`, err);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`[Firestore] Network error saving ${collection}/${docId}:`, err.message);
    return false;
  }
}

/**
 * Obtém um documento do Cloud Firestore
 */
export async function getFirestoreDocument(collection: string, docId: string): Promise<any | null> {
  if (!API_KEY) return null;

  const url = `${BASE_URL}/${encodeURIComponent(collection)}/${encodeURIComponent(docId)}?key=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`[Firestore] Error reading ${collection}/${docId} (${res.status})`);
      return null;
    }
    const doc = await res.json();
    return parseFirestoreDoc(doc);
  } catch (err: any) {
    console.error(`[Firestore] Error fetching ${collection}/${docId}:`, err.message);
    return null;
  }
}

/**
 * Exclui um documento do Cloud Firestore
 */
export async function deleteFirestoreDocument(collection: string, docId: string): Promise<boolean> {
  if (!API_KEY) return false;

  const url = `${BASE_URL}/${encodeURIComponent(collection)}/${encodeURIComponent(docId)}?key=${API_KEY}`;

  try {
    const res = await fetch(url, { method: 'DELETE' });
    return res.ok;
  } catch (err: any) {
    console.error(`[Firestore] Error deleting ${collection}/${docId}:`, err.message);
    return false;
  }
}

/**
 * Consulta todos os documentos de uma coleção via runQuery
 */
export async function queryFirestoreCollection(collectionName: string): Promise<any[]> {
  if (!API_KEY) return [];

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents:runQuery?key=${API_KEY}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: collectionName }],
        },
      }),
    });

    if (!res.ok) {
      console.warn(`[Firestore] runQuery on ${collectionName} returned ${res.status}`);
      return [];
    }

    const results = await res.json();
    if (!Array.isArray(results)) return [];

    const items: any[] = [];
    for (const item of results) {
      if (item.document) {
        const parsed = parseFirestoreDoc(item.document);
        if (parsed) items.push(parsed);
      }
    }
    return items;
  } catch (err: any) {
    console.error(`[Firestore] Error querying ${collectionName}:`, err.message);
    return [];
  }
}

export const serverFirestore = {
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  set: setFirestoreDocument,
  get: getFirestoreDocument,
  delete: deleteFirestoreDocument,
  query: queryFirestoreCollection,
};
