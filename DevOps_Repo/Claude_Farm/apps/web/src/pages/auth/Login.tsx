import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuth.js';

export function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/');
    } catch {
      setError('Invalid phone number or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-green-800 mb-2">FarmConnect SA</h1>
        <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>
        {error && <p className="bg-red-50 text-red-700 text-sm rounded p-3 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+27821234567" className="w-full border rounded p-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded p-2 text-sm" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-700 text-white py-2.5 rounded font-medium hover:bg-green-800 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          New to FarmConnect? <Link to="/register" className="text-green-700 font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}
