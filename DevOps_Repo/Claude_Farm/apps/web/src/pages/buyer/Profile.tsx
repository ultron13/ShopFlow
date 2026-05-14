import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';

export function BuyerProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    vatNumber: '',
    contactPhone: '',
    deliveryAddress: '',
    deliveryCity: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function load() {
    api.get('/buyer/profile').then(({ data }) => {
      setProfile(data.buyer);
      if (data.buyer) {
        setForm({
          businessName: data.buyer.businessName ?? '',
          vatNumber: data.buyer.vatNumber ?? '',
          contactPhone: data.buyer.contactPhone ?? '',
          deliveryAddress: data.buyer.deliveryAddress ?? '',
          deliveryCity: data.buyer.deliveryCity ?? '',
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    await api.patch('/buyer/profile', form);
    setSaving(false);
    setEditing(false);
    setSaved(true);
    load();
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Business Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">
            Edit
          </button>
        )}
      </div>

      {saved && (
        <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
          Profile updated successfully.
        </div>
      )}

      {profile ? (
        <div className="bg-white border rounded-lg divide-y">
          {[
            { label: 'Business name', key: 'businessName', value: profile.businessName },
            { label: 'VAT number', key: 'vatNumber', value: profile.vatNumber ?? '—' },
            { label: 'Contact phone', key: 'contactPhone', value: profile.contactPhone },
            { label: 'Delivery address', key: 'deliveryAddress', value: profile.deliveryAddress },
            { label: 'Delivery city', key: 'deliveryCity', value: profile.deliveryCity },
          ].map(({ label, key, value }) => (
            <div key={key} className="flex items-center px-4 py-3 gap-4">
              <p className="text-sm text-gray-500 w-40 shrink-0">{label}</p>
              {editing ? (
                <input
                  value={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="flex-1 border rounded px-3 py-1.5 text-sm"
                />
              ) : (
                <p className="text-sm font-medium">{value}</p>
              )}
            </div>
          ))}

          <div className="px-4 py-3 flex items-center gap-4">
            <p className="text-sm text-gray-500 w-40 shrink-0">Account name</p>
            <p className="text-sm font-medium">{profile.user?.name}</p>
          </div>
          <div className="px-4 py-3 flex items-center gap-4">
            <p className="text-sm text-gray-500 w-40 shrink-0">Phone</p>
            <p className="text-sm font-medium">{profile.user?.phone}</p>
          </div>
          {profile.user?.email && (
            <div className="px-4 py-3 flex items-center gap-4">
              <p className="text-sm text-gray-500 w-40 shrink-0">Email</p>
              <p className="text-sm font-medium">{profile.user.email}</p>
            </div>
          )}
          <div className="px-4 py-3 flex items-center gap-4">
            <p className="text-sm text-gray-500 w-40 shrink-0">Verification</p>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${profile.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {profile.isVerified ? 'Verified' : 'Pending verification'}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No profile yet — place your first order to create one.</p>
      )}

      {editing && (
        <div className="flex gap-2 mt-4">
          <button onClick={() => setEditing(false)} className="flex-1 border rounded py-2 text-sm">Cancel</button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 bg-green-700 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}
    </div>
  );
}
