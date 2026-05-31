// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import DataPKSPage from '../pages/DataPKSPage';
import DataPerusahaanPage from '../pages/DataPerusahaanPage';
import DetailPerusahaanPage from '../pages/DetailPerusahaanPage';
import NotifikasiPage from '../pages/NotifikasiPage';
import { authService } from '../services/authService';

// Pengaman Rute (Auth Guard)
function ProtectedRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rute Login Publik */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rute Sistem Internal Terproteksi */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirect Root ke Dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="pks" element={<DataPKSPage />} />
        <Route path="perusahaan" element={<DataPerusahaanPage />} />
        <Route path="perusahaan/:id" element={<DetailPerusahaanPage />} />
        <Route path="notifikasi" element={<NotifikasiPage />} />
      </Route>

      {/* Fallback Catch-all -> Redirect ke Dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
