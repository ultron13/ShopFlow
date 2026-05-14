import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './hooks/useAuth.js';
import { Navbar } from './components/Navbar.js';
import { Login } from './pages/auth/Login.js';
import { Register } from './pages/auth/Register.js';
import { Listings } from './pages/buyer/Listings.js';
import { Orders } from './pages/buyer/Orders.js';
import { BuyerLayout } from './pages/buyer/BuyerLayout.js';
import { BuyerOrderDetail } from './pages/buyer/OrderDetail.js';
import { BuyerProfile } from './pages/buyer/Profile.js';
import { FarmerDashboard } from './pages/farmer/Dashboard.js';
import { FarmerLayout } from './pages/farmer/FarmerLayout.js';
import { FarmerListings } from './pages/farmer/Listings.js';
import { FarmerOrders } from './pages/farmer/Orders.js';
import { FarmerPayouts } from './pages/farmer/Payouts.js';
import { GradingForm } from './pages/field-agent/GradingForm.js';
import { AgentLayout } from './pages/field-agent/AgentLayout.js';
import { AgentCollections } from './pages/field-agent/Collections.js';
import { AdminDashboard } from './pages/admin/Dashboard.js';
import { AdminLayout } from './pages/admin/AdminLayout.js';
import { AdminOrders } from './pages/admin/Orders.js';
import { OrderDetail } from './pages/admin/OrderDetail.js';
import { AdminDeliveries } from './pages/admin/Deliveries.js';
import { AdminPayments } from './pages/admin/Payments.js';
import { AdminDisputes } from './pages/admin/Disputes.js';

const ROLE_HOME: Record<string, string> = {
  BUYER: '/buyer/listings',
  FARMER: '/farmer',
  FIELD_AGENT: '/agent/collections',
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

        {/* Redirect old bookmark-style paths */}
        <Route path="/listings" element={<Navigate to="/buyer/listings" replace />} />
        <Route path="/orders" element={<Navigate to="/buyer/orders" replace />} />

        <Route path="/buyer" element={
          <PrivateRoute roles={['BUYER']}>
            <Layout>
              <BuyerLayout />
            </Layout>
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/buyer/listings" replace />} />
          <Route path="listings" element={<Listings />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<BuyerOrderDetail />} />
          <Route path="profile" element={<BuyerProfile />} />
        </Route>

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

        {/* Redirect old /grade links */}
        <Route path="/grade" element={<Navigate to="/agent/collections" replace />} />
        <Route path="/grade/:collectionId" element={<Navigate to="/agent/collections" replace />} />

        <Route path="/agent" element={
          <PrivateRoute roles={['FIELD_AGENT']}>
            <Layout>
              <AgentLayout />
            </Layout>
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/agent/collections" replace />} />
          <Route path="collections" element={<AgentCollections />} />
          <Route path="collections/:collectionId" element={<GradingForm />} />
        </Route>

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
