import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuthStore } from '../../hooks/useAuth.js';

export function Register() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', role: 'BUYER' as const, popiaConsent: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.popiaConsent) { setError('You must accept the privacy policy to register.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', { ...form, popiaConsent: true });
      await login(form.phone, form.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error === 'CONFLICT' ? 'Phone number already registered.' : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-green-800 mb-6">Create Account</h1>
        {error && <p className="bg-red-50 text-red-700 text-sm rounded p-3 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded p-2 text-sm" required />
          <input placeholder="+27821234567" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded p-2 text-sm" required />
          <input placeholder="Email (optional)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded p-2 text-sm" />
          <input placeholder="Password (8+ characters)" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded p-2 text-sm" required />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })} className="w-full border rounded p-2 text-sm">
            <option value="BUYER">Restaurant / Buyer</option>
            <option value="FARMER">Cooperative / Farmer</option>
          </select>
          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={form.popiaConsent} onChange={(e) => setForm({ ...form, popiaConsent: e.target.checked })} className="mt-0.5" />
            <span>I agree to FarmConnect's <a href="/privacy" className="text-green-700">Privacy Policy</a> and consent to my data being processed (POPIA)</span>
          </label>
          <button type="submit" disabled={loading} className="w-full bg-green-700 text-white py-2.5 rounded font-medium hover:bg-green-800 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already registered? <Link to="/login" className="text-green-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
