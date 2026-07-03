import React from 'react';
import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products = [] }) {
  return (
    <section className="product-grid">
      <div className="grid-inner">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
