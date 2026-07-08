import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import { useProducts } from './hooks/useProducts.js';
import { CartProvider } from './context/CartContext.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Checkout from './pages/Checkout.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import ProtectedRoute from './admin/ProtectedRoute.jsx';
import LoginPage from './admin/LoginPage.jsx';
import DashboardPage from './admin/DashboardPage.jsx';
import ProductsPage from './admin/ProductsPage.jsx';
import CategoriesPage from './admin/CategoriesPage.jsx';
import OrdersPage from './admin/OrdersPage.jsx';
import SettingsPage from './admin/SettingsPage.jsx';

function PublicApp() {
  const { products, loading } = useProducts();
  const [cartOpen, setCartOpen] = React.useState(false);
  const [selectedMaterial, setSelectedMaterial] = React.useState('');

  const handleSelectMaterial = React.useCallback((material) => {
    setSelectedMaterial(material);
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        const target = document.getElementById('catalogo');
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, []);

  return (
    <CartProvider>
      <div className="app-shell bg-deep-black text-white">
        <Header onOpenCart={() => setCartOpen(true)} />
        <div className="min-h-screen">
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <Hero onSelectMaterial={handleSelectMaterial} selectedMaterial={selectedMaterial} />
                  <ProductGrid products={products} loading={loading} selectedMaterial={selectedMaterial} onSelectMaterial={handleSelectMaterial} />
                </div>
              }
            />
            <Route path="/product/:id" element={<ProductPageWrapper />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
        {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
      </div>
    </CartProvider>
  );
}

function ProductPageWrapper() {
  const { id } = useParams();
  return <ProductPage id={id} />;
}

function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<PublicApp />} />
      </Routes>
    </BrowserRouter>
  );
}
