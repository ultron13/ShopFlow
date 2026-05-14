import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOfflineQueue, enqueue } from '../../hooks/useOfflineQueue.js';
import { api } from '../../lib/api.js';

interface Collection {
  id: string;
  scheduledAt: string;
  confirmedAt: string | null;
  actualWeightKg: number | null;
  notes: string | null;
  derivedStatus: 'PENDING' | 'GRADED' | 'CONFIRMED';
  cooperative: { name: string; city: string; province: string; contactPhone: string };
  gradeRecord: {
    grade: string;
    blemishPct: number;
    uniformityPct: number;
    moistureLoss: number | null;
    fieldAgentNotes: string | null;
  } | null;
}

export function GradingForm() {
  const { collectionId } = useParams<{ collectionId?: string }>();
  const navigate = useNavigate();
  useOfflineQueue();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  const [gradeForm, setGradeForm] = useState({
    grade: 'A' as 'A' | 'B' | 'C',
    blemishPct: 0,
    uniformityPct: 100,
    moistureLoss: '',
    fieldAgentNotes: '',
  });
  const [weightKg, setWeightKg] = useState('');
  const [step, setStep] = useState<'grade' | 'confirm'>('grade');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);

  useEffect(() => {
    if (!collectionId) { setLoading(false); return; }
    api.get(`/agent/collections/${collectionId}`).then(({ data }) => {
      const c: Collection = data.collection;
      setCollection(c);
      // Pre-fill if already graded
      if (c.gradeRecord) {
        setGradeForm({
          grade: c.gradeRecord.grade as 'A' | 'B' | 'C',
          blemishPct: c.gradeRecord.blemishPct,
          uniformityPct: c.gradeRecord.uniformityPct,
          moistureLoss: c.gradeRecord.moistureLoss != null ? String(c.gradeRecord.moistureLoss) : '',
          fieldAgentNotes: c.gradeRecord.fieldAgentNotes ?? '',
        });
        setStep('confirm');
      }
      if (c.confirmedAt) {
        setWeightKg(String(c.actualWeightKg ?? ''));
        setDone(true);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [collectionId]);

  async function submitGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!collectionId) return;
    setSubmitting(true);
    const payload = {
      grade: gradeForm.grade,
      blemishPct: gradeForm.blemishPct,
      uniformityPct: gradeForm.uniformityPct,
      ...(gradeForm.moistureLoss !== '' && { moistureLoss: Number(gradeForm.moistureLoss) }),
      fieldAgentNotes: gradeForm.fieldAgentNotes || undefined,
    };
    try {
      await api.post(`/collections/${collectionId}/grade`, payload);
      setStep('confirm');
    } catch {
      enqueue('POST', `/collections/${collectionId}/grade`, payload);
      setSavedOffline(true);
      setStep('confirm');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmWeight(e: React.FormEvent) {
    e.preventDefault();
    if (!collectionId) return;
    setSubmitting(true);
    const payload = { actualWeightKg: Number(weightKg) };
    try {
      await api.patch(`/collections/${collectionId}/confirm`, payload);
      setDone(true);
    } catch {
      enqueue('PATCH', `/collections/${collectionId}/confirm`, payload);
      setSavedOffline(true);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (!collectionId) {
    return (
      <div className="max-w-md mx-auto p-8 text-center text-gray-500">
        <p className="font-medium">No collection specified</p>
        <button onClick={() => navigate('/agent/collections')} className="mt-3 text-sm text-green-700 hover:underline">
          View my collections
        </button>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (!collection) return <div className="p-8 text-center text-gray-400">Collection not found</div>;

  if (done) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <div className="text-5xl mb-3">{savedOffline ? '⏳' : '✓'}</div>
        <h2 className="text-lg font-semibold text-gray-800">
          {savedOffline ? 'Saved offline — will sync when connected' : 'Collection confirmed'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {collection.cooperative.name} · {Number(weightKg) || collection.actualWeightKg} kg at Grade {gradeForm.grade}
        </p>
        <button
          onClick={() => navigate('/agent/collections')}
          className="mt-5 px-5 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-800"
        >
          Back to collections
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <button onClick={() => navigate('/agent/collections')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 block">
        ← Collections
      </button>

      {/* Collection info card */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">
        <p className="font-semibold text-green-800">{collection.cooperative.name}</p>
        <p className="text-sm text-gray-600">{collection.cooperative.city}, {collection.cooperative.province}</p>
        <p className="text-sm text-gray-600 mt-0.5">
          Scheduled: {new Date(collection.scheduledAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
        {collection.cooperative.contactPhone && (
          <a
            href={`tel:${collection.cooperative.contactPhone}`}
            className="text-sm text-green-700 hover:underline mt-0.5 block"
          >
            {collection.cooperative.contactPhone}
          </a>
        )}
        {collection.notes && <p className="text-xs text-gray-500 mt-1 italic">{collection.notes}</p>}
      </div>

      {!navigator.onLine && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm text-yellow-800">
          You are offline. Submissions will sync when connected.
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-5">
        <div className={`flex items-center gap-1.5 text-sm font-medium ${step === 'grade' ? 'text-green-700' : 'text-gray-400'}`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 'grade' ? 'bg-green-700 text-white' : 'bg-green-100 text-green-700'}`}>
            {step === 'confirm' ? '✓' : '1'}
          </div>
          Grade produce
        </div>
        <div className="flex-1 h-px bg-gray-200" />
        <div className={`flex items-center gap-1.5 text-sm font-medium ${step === 'confirm' ? 'text-green-700' : 'text-gray-400'}`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 'confirm' ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-400'}`}>
            2
          </div>
          Confirm weight
        </div>
      </div>

      {step === 'grade' ? (
        <form onSubmit={submitGrade} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Grade</label>
            <div className="grid grid-cols-3 gap-2">
              {(['A', 'B', 'C'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGradeForm({ ...gradeForm, grade: g })}
                  className={`py-3 rounded border-2 text-sm font-bold transition-colors ${
                    gradeForm.grade === g
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  Grade {g}
                  <span className="block text-xs font-normal mt-0.5">
                    {g === 'A' ? 'Premium' : g === 'B' ? 'Standard' : 'Processing'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Blemish %</label>
              <input
                type="number" min="0" max="100" step="0.5" required
                value={gradeForm.blemishPct}
                onChange={e => setGradeForm({ ...gradeForm, blemishPct: Number(e.target.value) })}
                className="w-full border rounded p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Uniformity %</label>
              <input
                type="number" min="0" max="100" step="0.5" required
                value={gradeForm.uniformityPct}
                onChange={e => setGradeForm({ ...gradeForm, uniformityPct: Number(e.target.value) })}
                className="w-full border rounded p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Moisture loss % <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="number" min="0" max="100" step="0.1"
              value={gradeForm.moistureLoss}
              onChange={e => setGradeForm({ ...gradeForm, moistureLoss: e.target.value })}
              placeholder="e.g. 2.5"
              className="w-full border rounded p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Field notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              rows={3} value={gradeForm.fieldAgentNotes}
              onChange={e => setGradeForm({ ...gradeForm, fieldAgentNotes: e.target.value })}
              placeholder="Observations about this batch..."
              className="w-full border rounded p-2 text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-green-700 text-white rounded font-medium hover:bg-green-800 disabled:opacity-50"
          >
            {submitting ? 'Saving grade…' : 'Save grade & continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={confirmWeight} className="space-y-4">
          {/* Grade summary */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Grade recorded</p>
            <div className="flex items-center gap-3">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-bold text-base">Grade {gradeForm.grade}</span>
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>Blemish: {gradeForm.blemishPct}%</p>
                <p>Uniformity: {gradeForm.uniformityPct}%</p>
                {gradeForm.moistureLoss !== '' && <p>Moisture loss: {gradeForm.moistureLoss}%</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Actual weight (kg)</label>
            <input
              type="number" min="0.1" step="0.1" required
              value={weightKg}
              onChange={e => setWeightKg(e.target.value)}
              placeholder="e.g. 850"
              className="w-full border rounded p-2 text-sm"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1">Weigh the load at the cooperative before entering.</p>
          </div>

          <button
            type="submit"
            disabled={submitting || !weightKg}
            className="w-full py-3 bg-green-700 text-white rounded font-medium hover:bg-green-800 disabled:opacity-50"
          >
            {submitting ? 'Confirming…' : 'Confirm collection'}
          </button>
        </form>
      )}
    </div>
  );
}
