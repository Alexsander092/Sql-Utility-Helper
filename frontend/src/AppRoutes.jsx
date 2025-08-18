import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginUser from './pages/LoginUser';
import LoginAdmin from './pages/LoginAdmin';
import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login-user" element={<LoginUser />} />
      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route path="/user" element={<UserPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/login-user" replace />} />
    </Routes>
  );
}

export default AppRoutes;
