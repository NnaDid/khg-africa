import * as SQLite from "expo-sqlite";
import { OfflineReport } from "../types";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync("khg_offline.db");
  await initializeDatabase(dbInstance);
  return dbInstance;
}

async function initializeDatabase(db: SQLite.SQLiteDatabase) {
  // Enable WAL journal mode for performance and concurrent read safety
  await db.execAsync("PRAGMA journal_mode = WAL;");

  // Create offline community reports queue table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS offline_reports (
      local_id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      description TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      local_image_url TEXT,
      local_voice_note_url TEXT,
      severity TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      reporter_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0,
      retry_count INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Create cached alerts table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cached_alerts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      hazard_type TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      region TEXT NOT NULL,
      issued_at TEXT NOT NULL,
      acknowledged INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Create cached schools table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cached_schools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      student_count INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      safety_score INTEGER NOT NULL DEFAULT 100
    );
  `);

  // Create cached clinics table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cached_clinics (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      safety_score INTEGER NOT NULL DEFAULT 100
    );
  `);
}

// ─── Offline Reports Helpers ───
export async function saveOfflineReport(report: OfflineReport): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO offline_reports (
      local_id, type, description, latitude, longitude,
      local_image_url, local_voice_note_url, severity, status, reporter_id, created_at, synced, retry_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      report.local_id,
      report.type,
      report.description || null,
      report.location.latitude,
      report.location.longitude,
      report.local_image_url || null,
      report.local_voice_note_url || null,
      report.severity,
      report.status,
      report.reporter_id,
      report.created_at,
      report.synced ? 1 : 0,
      report.retry_count || 0,
    ]
  );
}

export async function getPendingOfflineReports(): Promise<OfflineReport[]> {
  const db = await getDb();
  const rows = await db.getAllAsync("SELECT * FROM offline_reports WHERE synced = 0 ORDER BY created_at ASC;");
  
  return rows.map((row: any) => ({
    local_id: row.local_id,
    type: row.type,
    description: row.description || undefined,
    location: {
      latitude: row.latitude,
      longitude: row.longitude,
    },
    local_image_url: row.local_image_url || undefined,
    local_voice_note_url: row.local_voice_note_url || undefined,
    severity: row.severity,
    status: row.status,
    reporter_id: row.reporter_id,
    created_at: row.created_at,
    synced: !!row.synced,
    retry_count: row.retry_count,
  }));
}

export async function markReportSynced(localId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE offline_reports SET synced = 1, status = 'RESOLVED' WHERE local_id = ?;", [localId]);
}

export async function incrementRetryCount(localId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE offline_reports SET retry_count = retry_count + 1 WHERE local_id = ?;", [localId]);
}

// ─── Caching Helpers ───
export async function cacheAlerts(alerts: any[]): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM cached_alerts;");
  for (const alert of alerts) {
    await db.runAsync(
      `INSERT OR REPLACE INTO cached_alerts (id, title, body, hazard_type, risk_level, region, issued_at, acknowledged)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [alert.id, alert.title, alert.body, alert.hazard_type, alert.risk_level, alert.region, alert.issued_at, alert.acknowledged ? 1 : 0]
    );
  }
}

export async function getCachedAlerts(): Promise<any[]> {
  const db = await getDb();
  return await db.getAllAsync("SELECT * FROM cached_alerts ORDER BY issued_at DESC;");
}

export async function cacheSchools(schools: any[]): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM cached_schools;");
  for (const school of schools) {
    await db.runAsync(
      `INSERT OR REPLACE INTO cached_schools (id, name, address, student_count, latitude, longitude, safety_score)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [school.id, school.name, school.address, school.student_count, school.latitude, school.longitude, school.safety_score || 100]
    );
  }
}

export async function getCachedSchools(): Promise<any[]> {
  const db = await getDb();
  return await db.getAllAsync("SELECT * FROM cached_schools;");
}

export async function cacheClinics(clinics: any[]): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM cached_clinics;");
  for (const clinic of clinics) {
    await db.runAsync(
      `INSERT OR REPLACE INTO cached_clinics (id, name, address, latitude, longitude, safety_score)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [clinic.id, clinic.name, clinic.address, clinic.latitude, clinic.longitude, clinic.safety_score || 100]
    );
  }
}

export async function getCachedClinics(): Promise<any[]> {
  const db = await getDb();
  return await db.getAllAsync("SELECT * FROM cached_clinics;");
}
