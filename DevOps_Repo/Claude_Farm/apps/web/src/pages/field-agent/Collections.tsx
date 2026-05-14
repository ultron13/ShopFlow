import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  GRADED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
};

const TABS = ['ALL', 'PENDING', 'GRADED', 'CONFIRMED'];

interface Collection {
  id: string;
  scheduledAt: string;
  confirmedAt: string | null;
  actualWeightKg: number | null;
  notes: string | null;
  derivedStatus: 'PENDING' | 'GRADED' | 'CONFIRMED';
  cooperative: { name: string; city: string; province: string; addressLine1: string };
  gradeRecord: {
    grade: string;
    blemishPct: number;
    uniformityPct: number;
    moistureLoss: number | null;
    fieldAgentNotes: string | null;
  } | null;
}

export function AgentCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/agent/collections').then(({ data }) => {
      setCollections(data.collections);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const visible = tab === 'ALL' ? collections : collections.filter(c => c.derivedStatus === tab);

  const counts = collections.reduce<Record<string, number>>((acc, c) => {
    acc[c.derivedStatus] = (acc[c.derivedStatus] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4">My Collections</h1>

      <div className="flex gap-1 mb-4">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              tab === t ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t}
            {t !== 'ALL' && counts[t] ? (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${tab === t ? 'bg-white text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                {counts[t]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">No {tab !== 'ALL' ? tab.toLowerCase() : ''} collections</p>
          {tab === 'ALL' && <p className="text-sm mt-1">Collections assigned to you by ops will appear here.</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((c) => (
            <div
              key={c.id}
              className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                c.derivedStatus === 'PENDING' ? 'border-l-4 border-l-yellow-400' : ''
              }`}
              onClick={() => c.derivedStatus !== 'CONFIRMED' && navigate(`/agent/collections/${c.id}`)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[c.derivedStatus]}`}>
                      {c.derivedStatus}
                    </span>
                    <span className="font-medium text-sm">{c.cooperative.name}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {c.cooperative.addressLine1}, {c.cooperative.city}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Scheduled: {new Date(c.scheduledAt).toLocaleString('en-ZA', {
                      dateStyle: 'medium', timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  {c.gradeRecord ? (
                    <div className="text-right">
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded text-sm font-bold">
                        Grade {c.gradeRecord.grade}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Blemish {c.gradeRecord.blemishPct}% · Uniformity {c.gradeRecord.uniformityPct}%
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-yellow-600 font-medium">Grading required</span>
                  )}
                  {c.confirmedAt && c.actualWeightKg && (
                    <p className="text-xs text-green-600 mt-1 font-medium">{c.actualWeightKg} kg confirmed</p>
                  )}
                </div>
              </div>

              {c.derivedStatus === 'PENDING' && (
                <div className="mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/agent/collections/${c.id}`); }}
                    className="w-full py-2 bg-green-700 text-white text-sm rounded hover:bg-green-800 font-medium"
                  >
                    Start grading
                  </button>
                </div>
              )}
              {c.derivedStatus === 'GRADED' && (
                <div className="mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/agent/collections/${c.id}`); }}
                    className="w-full py-2 border border-green-700 text-green-700 text-sm rounded hover:bg-green-50 font-medium"
                  >
                    Confirm weight
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
