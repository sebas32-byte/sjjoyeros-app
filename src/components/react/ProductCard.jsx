import React from 'react';

export default function ProductCard({ product }) {
  return (
    <article className="product-card" data-product-id={product?.id || ''}>
      <div className="product-visual" aria-hidden="true"></div>
      <div className="product-body">
        <h3 className="product-name">{product?.name || ''}</h3>
        <p className="product-category">{product?.category || ''}</p>
        <p className="product-price">{product?.price ? new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(product.price) : ''}</p>
        <div className="product-actions">
          <button className="btn-secondary" data-action="view">Ver</button>
          <button className="btn-primary" data-action="buy">Comprar</button>
        </div>
      </div>
    </article>
  );
}
