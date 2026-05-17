import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import {
  getPendingOfflineReports,
  markReportSynced,
  incrementReportRetry,
} from './database';
import apiClient from '../lib/axios';

const MAX_RETRY = 5;
let syncInProgress = false;

// ─── Start sync engine ────────────────────────────────────────────────────────
export function startSyncEngine(onSynced?: (count: number) => void): () => void {
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    if (state.isConnected && state.isInternetReachable) {
      runSyncCycle(onSynced);
    }
  });
  return unsubscribe;
}

// ─── Sync cycle ───────────────────────────────────────────────────────────────
export async function runSyncCycle(onSynced?: (count: number) => void): Promise<void> {
  if (syncInProgress) return;
  syncInProgress = true;
  let syncedCount = 0;

  try {
    const pending = await getPendingOfflineReports();

    for (const report of pending) {
      if (report.retry_count >= MAX_RETRY) continue;

      try {
        // Build form data for multipart upload
        const formData = new FormData();
        formData.append('type', report.type);
        formData.append('latitude', String(report.location.latitude));
        formData.append('longitude', String(report.location.longitude));
        formData.append('reporter_id', report.reporter_id);
        formData.append('created_at', report.created_at);
        if (report.description) formData.append('description', report.description);
        if (report.severity) formData.append('severity', report.severity);
        if (report.status) formData.append('status', report.status);

        // Attach image
        if (report.local_image_url) {
          const filename = report.local_image_url.split('/').pop() ?? 'image.jpg';
          formData.append('image', {
            uri: report.local_image_url,
            name: filename,
            type: 'image/jpeg',
          } as any);
        }

        // Attach voice note
        if (report.local_voice_note_url) {
          const filename = report.local_voice_note_url.split('/').pop() ?? 'voice.m4a';
          formData.append('voice_note', {
            uri: report.local_voice_note_url,
            name: filename,
            type: 'audio/m4a',
          } as any);
        }

        await apiClient.post('/reports/submit', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        await markReportSynced(report.local_id);
        syncedCount++;
      } catch (err: any) {
        const errorMsg = err?.message ?? 'Unknown error';
        await incrementReportRetry(report.local_id, errorMsg);
      }
    }

    if (syncedCount > 0) {
      onSynced?.(syncedCount);
    }
  } finally {
    syncInProgress = false;
  }
}
