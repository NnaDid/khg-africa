import * as SQLite from 'expo-sqlite';
import { OfflineReport, QueueItem } from '../types';

const DB_NAME = 'khg_africa.db';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync(DB_NAME);
  await initializeSchema(_db);
  return _db;
}

async function initializeSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    -- Offline reports queue
    CREATE TABLE IF NOT EXISTS offline_reports (
      local_id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      description TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      local_image_url TEXT,
      local_voice_note_url TEXT,
      severity TEXT,
      status TEXT DEFAULT 'PENDING',
      reporter_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      retry_count INTEGER DEFAULT 0,
      last_error TEXT
    );

    -- Generic API queue
    CREATE TABLE IF NOT EXISTS api_queue (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      retry_count INTEGER DEFAULT 0,
      last_error TEXT
    );

    -- Cached alerts
    CREATE TABLE IF NOT EXISTS cached_alerts (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      cached_at TEXT NOT NULL
    );

    -- Cached schools
    CREATE TABLE IF NOT EXISTS cached_schools (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      cached_at TEXT NOT NULL
    );

    -- Cached clinics
    CREATE TABLE IF NOT EXISTS cached_clinics (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      cached_at TEXT NOT NULL
    );
  `);
}

// ─── Offline Reports ─────────────────────────────────────────────────────────

export async function saveOfflineReport(report: OfflineReport): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO offline_reports
      (local_id, type, description, latitude, longitude, local_image_url, 
       local_voice_note_url, severity, status, reporter_id, created_at, synced, retry_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      report.local_id,
      report.type,
      report.description ?? null,
      report.location.latitude,
      report.location.longitude,
      report.local_image_url ?? null,
      report.local_voice_note_url ?? null,
      report.severity ?? null,
      report.status ?? 'PENDING',
      report.reporter_id,
      report.created_at,
      report.synced,
      report.retry_count,
    ]
  );
}

export async function getPendingOfflineReports(): Promise<OfflineReport[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM offline_reports WHERE synced = 0 ORDER BY created_at ASC`
  );
  return rows.map(mapRowToReport);
}

export async function markReportSynced(localId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE offline_reports SET synced = 1 WHERE local_id = ?`, [localId]);
}

export async function incrementReportRetry(localId: string, error: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE offline_reports SET retry_count = retry_count + 1, last_error = ? WHERE local_id = ?`,
    [error, localId]
  );
}

function mapRowToReport(row: Record<string, unknown>): OfflineReport {
  return {
    local_id: row.local_id as string,
    type: row.type as any,
    description: row.description as string | undefined,
    location: {
      latitude: row.latitude as number,
      longitude: row.longitude as number,
    },
    local_image_url: row.local_image_url as string | undefined,
    local_voice_note_url: row.local_voice_note_url as string | undefined,
    severity: row.severity as any,
    status: row.status as any,
    reporter_id: row.reporter_id as string,
    created_at: row.created_at as string,
    synced: (row.synced as number) as 0 | 1,
    retry_count: row.retry_count as number,
  };
}

// ─── Cache: Alerts ────────────────────────────────────────────────────────────
export async function cacheAlerts(alerts: unknown[]): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync('DELETE FROM cached_alerts', []);
  for (const alert of alerts) {
    const a = alert as { id: string };
    await db.runAsync(
      `INSERT OR REPLACE INTO cached_alerts (id, data, cached_at) VALUES (?, ?, ?)`,
      [a.id, JSON.stringify(alert), now]
    );
  }
}

export async function getCachedAlerts(): Promise<unknown[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ data: string }>(
    `SELECT data FROM cached_alerts ORDER BY cached_at DESC`
  );
  return rows.map((r) => JSON.parse(r.data));
}

// ─── Cache: Schools ───────────────────────────────────────────────────────────
export async function cacheSchools(schools: unknown[]): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync('DELETE FROM cached_schools', []);
  for (const s of schools) {
    const school = s as { id: string };
    await db.runAsync(
      `INSERT OR REPLACE INTO cached_schools (id, data, cached_at) VALUES (?, ?, ?)`,
      [school.id, JSON.stringify(s), now]
    );
  }
}

export async function getCachedSchools(): Promise<unknown[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ data: string }>(`SELECT data FROM cached_schools`);
  return rows.map((r) => JSON.parse(r.data));
}

// ─── Cache: Clinics ───────────────────────────────────────────────────────────
export async function cacheClinics(clinics: unknown[]): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync('DELETE FROM cached_clinics', []);
  for (const c of clinics) {
    const clinic = c as { id: string };
    await db.runAsync(
      `INSERT OR REPLACE INTO cached_clinics (id, data, cached_at) VALUES (?, ?, ?)`,
      [clinic.id, JSON.stringify(c), now]
    );
  }
}

export async function getCachedClinics(): Promise<unknown[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ data: string }>(`SELECT data FROM cached_clinics`);
  return rows.map((r) => JSON.parse(r.data));
}
