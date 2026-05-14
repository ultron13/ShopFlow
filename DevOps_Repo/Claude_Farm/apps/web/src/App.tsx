import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './hooks/useAuth.js';
import { Login } from './pages/auth/Login.js';
import { Register } from './pages/auth/Register.js';
import { Listings } from './pages/buyer/Listings.js';
import { Orders } from './pages/buyer/Orders.js';
import { GradingForm } from './pages/field-agent/GradingForm.js';
import { AdminDashboard } from './pages/admin/Dashboard.js';

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/listings" element={<PrivateRoute roles={['BUYER']}><Listings /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute roles={['BUYER']}><Orders /></PrivateRoute>} />
        <Route path="/grade" element={<PrivateRoute roles={['FIELD_AGENT']}><GradingForm /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute roles={['OPS_ADMIN', 'PLATFORM_ADMIN']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/listings" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
