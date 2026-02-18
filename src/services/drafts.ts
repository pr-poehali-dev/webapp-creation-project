export interface DraftScore {
  criterion_id: number;
  score: number;
  comment: string;
}

export interface ClientDraft {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  matrix_id: string;
  matrix_name: string;
  scores: DraftScore[];
  created_at: string;
  synced: boolean;
  sync_error?: string;
}

export interface CachedMatrix {
  id: number;
  name: string;
}

export interface CachedCriterionStatus {
  id: number;
  criterion_id: number;
  label: string;
  weight: number;
  sort_order: number;
}

export interface CachedCriterion {
  id: number;
  name: string;
  description: string;
  axis: string;
  weight: number;
  min_value: number;
  max_value: number;
  statuses?: CachedCriterionStatus[];
}

const DRAFTS_KEY = 'client_drafts';
const MATRICES_CACHE_KEY = 'cached_matrices';
const CRITERIA_CACHE_KEY = 'cached_criteria';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getDrafts(): ClientDraft[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDraft(draft: Omit<ClientDraft, 'id' | 'created_at' | 'synced'>): ClientDraft {
  const drafts = getDrafts();
  const newDraft: ClientDraft = {
    ...draft,
    id: generateId(),
    created_at: new Date().toISOString(),
    synced: false,
  };
  drafts.unshift(newDraft);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return newDraft;
}

export function updateDraft(id: string, updates: Partial<ClientDraft>): void {
  const drafts = getDrafts();
  const idx = drafts.findIndex(d => d.id === id);
  if (idx !== -1) {
    drafts[idx] = { ...drafts[idx], ...updates };
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  }
}

export function removeDraft(id: string): void {
  const drafts = getDrafts().filter(d => d.id !== id);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export function getUnsyncedDrafts(): ClientDraft[] {
  return getDrafts().filter(d => !d.synced);
}

export function cacheMatrices(matrices: CachedMatrix[]): void {
  localStorage.setItem(MATRICES_CACHE_KEY, JSON.stringify(matrices));
}

export function getCachedMatrices(): CachedMatrix[] {
  try {
    const raw = localStorage.getItem(MATRICES_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function cacheCriteria(matrixId: number, criteria: CachedCriterion[]): void {
  try {
    const all = JSON.parse(localStorage.getItem(CRITERIA_CACHE_KEY) || '{}');
    all[matrixId] = criteria;
    localStorage.setItem(CRITERIA_CACHE_KEY, JSON.stringify(all));
  } catch {
    const obj: Record<number, CachedCriterion[]> = {};
    obj[matrixId] = criteria;
    localStorage.setItem(CRITERIA_CACHE_KEY, JSON.stringify(obj));
  }
}

export function getCachedCriteria(matrixId: number): CachedCriterion[] | null {
  try {
    const all = JSON.parse(localStorage.getItem(CRITERIA_CACHE_KEY) || '{}');
    return all[matrixId] || null;
  } catch {
    return null;
  }
}

export async function syncDraft(draft: ClientDraft): Promise<boolean> {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const payload: Record<string, unknown> = {
      action: 'create',
      company_name: draft.company_name,
      contact_person: draft.contact_person || null,
      email: draft.email || null,
      phone: draft.phone || null,
      matrix_id: draft.matrix_id ? parseInt(draft.matrix_id) : null,
    };

    if (draft.scores.length > 0) {
      payload.scores = draft.scores;
    }

    const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      updateDraft(draft.id, { sync_error: data.error || 'Ошибка сервера' });
      return false;
    }

    updateDraft(draft.id, { synced: true, sync_error: undefined });
    return true;
  } catch {
    updateDraft(draft.id, { sync_error: 'Нет подключения' });
    return false;
  }
}

export async function syncAllDrafts(): Promise<{ success: number; failed: number }> {
  const unsynced = getUnsyncedDrafts();
  let success = 0;
  let failed = 0;

  for (const draft of unsynced) {
    const ok = await syncDraft(draft);
    if (ok) success++;
    else failed++;
  }

  return { success, failed };
}
