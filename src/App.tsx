import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Purchase from './pages/Purchase';
import Sale from './pages/Sale';
import Inventory from './pages/Inventory';
import Categories from './pages/Categories';
import History from './pages/History';
import Settings from './pages/Settings';
import ProductAnalytics from './pages/ProductAnalytics';
import AdminParameters from './pages/AdminParameters';
import AdminStoreTypes from './pages/AdminStoreTypes';
import AiRecommendations from './pages/AiRecommendations';
import CalculationLogs from './pages/CalculationLogs';
import AdminUsers from './pages/AdminUsers';
import Login from './pages/Login';
import Register from './pages/Register';
import SupportChat from './pages/SupportChat';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Routes */}
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>} />
        <Route path="/products/:id/analytics" element={<ProtectedRoute><Layout><ProductAnalytics /></Layout></ProtectedRoute>} />
        <Route path="/purchase" element={<ProtectedRoute><Layout><Purchase /></Layout></ProtectedRoute>} />
        <Route path="/sale" element={<ProtectedRoute><Layout><Sale /></Layout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Layout><Categories /></Layout></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        <Route path="/ai-recommendations" element={<ProtectedRoute><Layout><AiRecommendations /></Layout></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Layout><SupportChat /></Layout></ProtectedRoute>} />

        {/* Protected Admin Routes */}
        <Route path="/admin/parameters" element={<ProtectedRoute adminOnly><Layout><AdminParameters /></Layout></ProtectedRoute>} />
        <Route path="/admin/store-types" element={<ProtectedRoute adminOnly><Layout><AdminStoreTypes /></Layout></ProtectedRoute>} />
        <Route path="/admin/logs" element={<ProtectedRoute adminOnly><Layout><CalculationLogs /></Layout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><Layout><AdminUsers /></Layout></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
