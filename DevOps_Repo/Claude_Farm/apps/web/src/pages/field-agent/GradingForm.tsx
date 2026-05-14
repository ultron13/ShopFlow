import { useState } from 'react';
import { useOfflineQueue, enqueue } from '../../hooks/useOfflineQueue.js';
import { api } from '../../lib/api.js';

interface GradeSubmission {
  grade: 'A' | 'B' | 'C';
  blemishPct: number;
  uniformityPct: number;
  fieldAgentNotes: string;
  actualWeightKg: number;
}

export function GradingForm({ collectionId }: { collectionId?: string }) {
  useOfflineQueue();
  const [form, setForm] = useState<GradeSubmission>({
    grade: 'A',
    blemishPct: 0,
    uniformityPct: 100,
    fieldAgentNotes: '',
    actualWeightKg: 0,
  });
  const [submitted, setSubmitted] = useState(false);
  const [offline, setOffline] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = collectionId ?? prompt('Collection ID:');
    if (!id) return;

    try {
      await api.post(`/collections/${id}/grade`, {
        grade: form.grade,
        blemishPct: form.blemishPct,
        uniformityPct: form.uniformityPct,
        fieldAgentNotes: form.fieldAgentNotes,
      });
      await api.patch(`/collections/${id}/confirm`, { actualWeightKg: form.actualWeightKg });
      setSubmitted(true);
    } catch {
      enqueue('POST', `/collections/${id}/grade`, form);
      setOffline(true);
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="text-green-600 text-4xl mb-2">{offline ? '⏳' : '✓'}</div>
        <h2 className="text-lg font-semibold">{offline ? 'Saved offline — will sync when connected' : 'Grade submitted successfully'}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Grade Collection</h1>
      {!navigator.onLine && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm text-yellow-800">
          You are offline. Submission will be saved and synced when connected.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Grade</label>
          <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value as 'A' | 'B' | 'C' })} className="w-full border rounded p-2">
            <option value="A">Grade A — Premium</option>
            <option value="B">Grade B — Standard</option>
            <option value="C">Grade C — Processing</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Blemish % (0-100)</label>
          <input type="number" min="0" max="100" step="0.5" value={form.blemishPct} onChange={(e) => setForm({ ...form, blemishPct: Number(e.target.value) })} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Uniformity % (0-100)</label>
          <input type="number" min="0" max="100" step="0.5" value={form.uniformityPct} onChange={(e) => setForm({ ...form, uniformityPct: Number(e.target.value) })} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Actual Weight (kg)</label>
          <input type="number" min="0" step="0.1" value={form.actualWeightKg} onChange={(e) => setForm({ ...form, actualWeightKg: Number(e.target.value) })} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea value={form.fieldAgentNotes} onChange={(e) => setForm({ ...form, fieldAgentNotes: e.target.value })} rows={3} className="w-full border rounded p-2" placeholder="Any observations about this batch..." />
        </div>
        <button type="submit" className="w-full bg-green-700 text-white py-3 rounded font-medium hover:bg-green-800">
          Submit Grade & Confirm Collection
        </button>
      </form>
    </div>
  );
}
