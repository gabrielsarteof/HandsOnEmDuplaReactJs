// src/pages/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Footer from "@components/Footer";
import Header from "@components/Header";
import HomePage from '@pages/HomePage';
import ProductsPage from '@pages/ProductsPage';
import AdminCreateProductPage from '@pages/admin/AdminCreateProductPage';
import AdminUsersPage from '@pages/admin/AdminUsersPage';
import AdminRoute from '@components/AdminRoute';
import ProtectedRoute from '@components/ProtectedRoute';
import LoginPage from '@pages/auth/LoginPage';
import RegisterPage from '@pages/auth/RegisterPage';
import ProfilePage from '@pages/auth/ProfilePage';
import ForgotPasswordPage from '@pages/auth/ForgotPasswordPage';
import UpdatePasswordPage from '@pages/auth/UpdatePasswordPage';
import AdminProductsPage from '@pages/admin/AdminProductsPage';

function App() {
  const [cartItemCount, setCartItemCount] = useState(0);
  
  // Função para adicionar ao carrinho
  const handleAddToCart = (product) => {
    setCartItemCount(prevCount => prevCount + 1);
    // Mostrar notificação
    toast.success(`${product.title} adicionado ao carrinho!`, {
      icon: '🛒',
      duration: 2000,
    });
  };

  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Header cartCount={cartItemCount} />
        <main className="container my-4 flex-grow-1">
          <Routes>
            <Route
              path="/"
              element={<HomePage onAddToCart={handleAddToCart} />} />
            <Route
              path="/login"
              element={<LoginPage />} />
            <Route
              path="/register"
              element={<RegisterPage />} />
            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />} />
            <Route
              path="/products"
              element={<ProductsPage onAddToCart={handleAddToCart} />} />
            <Route
              path="/update-password"
              element={<UpdatePasswordPage />} />
            <Route
              path="/user/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProductsPage />
                </AdminRoute>
              } />
            <Route
              path="/admin/products/new"
              element={
                <AdminRoute>
                  <AdminCreateProductPage />
                </AdminRoute>
              } />
            <Route
              path="/admin/products/edit/:id"
              element={
                <AdminRoute>
                  <AdminCreateProductPage />
                </AdminRoute>
              } />
            <Route            
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              } />
          </Routes>
        </main>
        <Footer />

        {/* Componente Toaster para mostrar notificações */}
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;