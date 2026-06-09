import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import Appointments from './components/Appointments';
import MedicalRecords from './components/MedicalRecords';
import Login from './components/Login';
import { api } from './api/axiosClient';

function Layout({ user, onLogout }) {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      withCredentials: true,
    });
    socket.on('patient:created', () => qc.invalidateQueries({ queryKey: ['patients'] }));
    socket.on('patient:updated', () => qc.invalidateQueries({ queryKey: ['patients'] }));
    socket.on('patient:deleted', () => qc.invalidateQueries({ queryKey: ['patients'] }));
    socket.on('record:created', () => qc.invalidateQueries({ queryKey: ['medicalRecords'] }));
    socket.on('record:updated', () => qc.invalidateQueries({ queryKey: ['medicalRecords'] }));
    socket.on('record:deleted', () => qc.invalidateQueries({ queryKey: ['medicalRecords'] }));
    return () => socket.disconnect();
  }, [qc]);

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🏥 HealthCare</h2>
        <NavLink to="/dashboard">📊 Dashboard</NavLink>
        <NavLink to="/patients">👥 Patients</NavLink>
        <NavLink to="/appointments">📅 Appointments</NavLink>
        <NavLink to="/medical-records">📋 Medical Records</NavLink>
        <button className="logout-btn" onClick={onLogout}>
          ⬅ Logout ({user?.name?.split(' ')[0]})
        </button>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

function AppRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    navigate('/dashboard');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    await api.post('/api/auth/logout').catch(() => {});
    setUser(null);
    navigate('/login');
  }, [navigate]);

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
      />
      <Route
        path="/*"
        element={
          user
            ? <Layout user={user} onLogout={handleLogout} />
            : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
