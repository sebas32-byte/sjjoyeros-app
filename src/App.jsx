import React from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import { useProducts } from './hooks/useProducts.js';
import { CartProvider } from './context/CartContext.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Checkout from './pages/Checkout.jsx';

function RouterView({ children }) {
  const path = window.location.pathname;
  const productMatch = path.match(/^\/product\/(.+)$/);
  if (path.startsWith('/checkout')) return <Checkout />;
  if (productMatch) return <ProductPage id={productMatch[1]} />;
  return children;
}

export default function App() {
  const { products } = useProducts();
  const [cartOpen, setCartOpen] = React.useState(false);

  return (
    <CartProvider>
      <div className="app-shell bg-deep-black text-white">
        <Header onOpenCart={() => setCartOpen(true)} />
        <div className="min-h-screen">
          <RouterView>
            <div>
              <Hero />
              <ProductGrid products={products} />
            </div>
          </RouterView>
        </div>
        <Footer />
        {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
      </div>
    </CartProvider>
  );
}
