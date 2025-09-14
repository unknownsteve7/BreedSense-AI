export interface StoredIdentification {
    id: number;
    prediction: string;
    imagePath: string; // data URL
    timestamp: string; // ISO string
    confidence: number;
    // optional runtime flags for UI
    status?: 'ok' | 'failed';
    errorMessage?: string | null;
}

const STORAGE_KEY = 'vxai_identifications_v1';

export function loadIdentifications(): StoredIdentification[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as StoredIdentification[];
        if (!Array.isArray(parsed)) return [];
        // Migration: mark legacy 'unknown' identifications with low confidence as failed
        let mutated = false;
        const migrated = parsed.map(item => {
            if ((item.status === undefined || item.status === null) && typeof item.prediction === 'string') {
                const p = item.prediction.toLowerCase();
                // Treat 'unknown' predictions with confidence <= 0.5 as failed captures (legacy behavior)
                if ((p === 'unknown' || p.includes('unknown')) && (typeof item.confidence === 'number' && item.confidence <= 0.5)) {
                    mutated = true;
                    return { ...item, prediction: 'No buffalo detected', confidence: 0, status: 'failed' as const, errorMessage: 'Legacy: likely no buffalo detected' };
                }
            }
            return item;
        });

        if (mutated) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
            } catch (e) {
                console.warn('Failed to save migrated identifications', e);
            }
        }

        return migrated;
    } catch (e) {
        console.error('Failed to load identifications from localStorage', e);
        return [];
    }
}

export function saveIdentification(item: Omit<StoredIdentification, 'id'>) {
    try {
        const list = loadIdentifications();
        const id = list.length > 0 ? Math.max(...list.map(i => i.id)) + 1 : 1;
        const next: StoredIdentification = { id, ...item };
        list.unshift(next); // newest first
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return next;
    } catch (e) {
        console.error('Failed to save identification to localStorage', e);
        return null as any;
    }
}

// Placeholder for API call to send image to backend. Replace with real endpoint.
import { API_BASE } from './api';

export function updateIdentification(id: number, patch: Partial<StoredIdentification>) {
    try {
        const list = loadIdentifications();
        const idx = list.findIndex(i => i.id === id);
        if (idx === -1) return null;
        list[idx] = { ...list[idx], ...patch };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return list[idx];
    } catch (e) {
        console.error('Failed to update identification', e);
        return null;
    }
}

function dataURLtoFile(dataurl: string, filename = 'upload.jpg') {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export async function sendToBackend(payload: { imagePath: string; prediction?: string; confidence?: number; timestamp: string; id?: number }) {
    try {
        // Convert data URL to File
        const file = dataURLtoFile(payload.imagePath, `capture-${Date.now()}.jpg`);

        const form = new FormData();
        form.append('file', file);

        const res = await fetch(`${API_BASE}/recognize_breed`, {
            method: 'POST',
            body: form
        });

        const text = await res.text();
        let json: any = undefined;
        try { json = text ? JSON.parse(text) : undefined; } catch (e) { /* ignore parse errors */ }

        if (!res.ok) {
            // Handle 400 explicitly with message from server
            const message = (json && (json.detail || json.message)) || text || `Server returned ${res.status}`;
            // mark saved identification as failed so History can render a red error card
            if (payload.id) {
                try {
                    updateIdentification(payload.id, {
                        prediction: 'No buffalo detected',
                        confidence: 0,
                        status: 'failed',
                        errorMessage: message
                    } as any);
                } catch (e) {
                    // ignore
                }
            }
            return { ok: false, status: res.status, message };
        }

        // success
        const body = json || {};
        if (payload.id) {
            updateIdentification(payload.id, {
                prediction: body.predicted_class || payload.prediction || 'unknown',
                confidence: typeof body.confidence_score === 'number' ? body.confidence_score : (payload.confidence || 0),
                status: 'ok',
                errorMessage: null
            });
        }

        return { ok: true, data: body };
    } catch (e) {
        console.warn('sendToBackend failed', e);
        return { ok: false, error: String(e) };
    }
}
