import { getPendingOfflineReports, markReportSynced, incrementRetryCount } from "./database";
import { backendApi } from "../services/api";

const MAX_RETRY_THRESHOLD = 5;

/**
 * Background synchronization cycle.
 * Iterates through SQLite pending queues, builds JSON batches,
 * updates Supabase/PostgreSQL via FastAPI REST API endpoints, and clears local queues.
 */
export async function runSyncCycle(onSuccessCallback?: (count: number) => void): Promise<number> {
  const pending = await getPendingOfflineReports();
  if (pending.length === 0) return 0;

  // Filter out records that exceeded the maximum retry limit to avoid queue blocking
  const validReports = pending.filter(r => (r.retry_count ?? 0) < MAX_RETRY_THRESHOLD);
  if (validReports.length === 0) return 0;

  // Format reports to match the FastAPI schema: list of objects with type, description, severity, lat, lng, image_url, etc.
  const formattedReports = validReports.map(report => ({
    type: report.type,
    description: report.description || "",
    severity: report.severity,
    lat: report.location.latitude,
    lng: report.location.longitude,
    image_url: report.local_image_url || undefined,
    created_at: report.created_at,
  }));

  try {
    // Send batch sync request
    const response = await backendApi.syncOfflineReports(formattedReports);
    
    if (response?.status === "synced") {
      // Mark all synchronized reports as successfully synced in local SQLite database
      for (const report of validReports) {
        await markReportSynced(report.local_id);
      }

      if (onSuccessCallback) {
        onSuccessCallback(validReports.length);
      }
      return validReports.length;
    } else {
      throw new Error("Invalid sync response from server");
    }
  } catch (error) {
    // If connection failed, increment retry counts on local rows
    for (const report of validReports) {
      await incrementRetryCount(report.local_id);
    }
    throw error;
  }
}
