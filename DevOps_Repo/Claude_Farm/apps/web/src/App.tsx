import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './hooks/useAuth.js';
import { Navbar } from './components/Navbar.js';
import { Login } from './pages/auth/Login.js';
import { Register } from './pages/auth/Register.js';
import { Listings } from './pages/buyer/Listings.js';
import { Orders } from './pages/buyer/Orders.js';
import { FarmerDashboard } from './pages/farmer/Dashboard.js';
import { FarmerLayout } from './pages/farmer/FarmerLayout.js';
import { FarmerListings } from './pages/farmer/Listings.js';
import { FarmerOrders } from './pages/farmer/Orders.js';
import { FarmerPayouts } from './pages/farmer/Payouts.js';
import { GradingForm } from './pages/field-agent/GradingForm.js';
import { AdminDashboard } from './pages/admin/Dashboard.js';
import { AdminLayout } from './pages/admin/AdminLayout.js';
import { AdminOrders } from './pages/admin/Orders.js';
import { OrderDetail } from './pages/admin/OrderDetail.js';
import { AdminDeliveries } from './pages/admin/Deliveries.js';
import { AdminPayments } from './pages/admin/Payments.js';
import { AdminDisputes } from './pages/admin/Disputes.js';

const ROLE_HOME: Record<string, string> = {
  BUYER: '/listings',
  FARMER: '/farmer',
  FIELD_AGENT: '/grade',
  OPS_ADMIN: '/admin',
  PLATFORM_ADMIN: '/admin',
};

function RoleHome() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />;
}

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />;
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/listings" element={
          <PrivateRoute roles={['BUYER']}>
            <Layout><Listings /></Layout>
          </PrivateRoute>
        } />

        <Route path="/orders" element={
          <PrivateRoute roles={['BUYER']}>
            <Layout><Orders /></Layout>
          </PrivateRoute>
        } />

        <Route path="/farmer" element={
          <PrivateRoute roles={['FARMER']}>
            <Layout>
              <FarmerLayout />
            </Layout>
          </PrivateRoute>
        }>
          <Route index element={<FarmerDashboard />} />
          <Route path="listings" element={<FarmerListings />} />
          <Route path="orders" element={<FarmerOrders />} />
          <Route path="payouts" element={<FarmerPayouts />} />
        </Route>

        <Route path="/grade" element={
          <PrivateRoute roles={['FIELD_AGENT']}>
            <Layout><GradingForm /></Layout>
          </PrivateRoute>
        } />

        <Route path="/grade/:collectionId" element={
          <PrivateRoute roles={['FIELD_AGENT']}>
            <Layout><GradingForm /></Layout>
          </PrivateRoute>
        } />

        <Route path="/admin" element={
          <PrivateRoute roles={['OPS_ADMIN', 'PLATFORM_ADMIN']}>
            <Layout>
              <AdminLayout />
            </Layout>
          </PrivateRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="deliveries" element={<AdminDeliveries />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="disputes" element={<AdminDisputes />} />
        </Route>

        <Route path="/" element={<RoleHome />} />
        <Route path="*" element={<RoleHome />} />
      </Routes>
    </BrowserRouter>
  );
}
