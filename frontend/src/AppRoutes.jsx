import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginUser from './pages/LoginUser';
import LoginAdmin from './pages/LoginAdmin';
import UserPage from './pages/UserPage';
import LandingPage from './pages/LandingPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login-user" element={<LoginUser />} />
      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route path="/user" element={<UserPage isAdmin={false} />} />
      <Route path="/admin" element={<UserPage isAdmin={true} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
