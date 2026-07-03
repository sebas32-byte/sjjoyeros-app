import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '../css/styles.css';

const mountEl = document.getElementById('root');
if (mountEl) {
  const root = createRoot(mountEl);
  root.render(<App />);
} else {
  // if no #root exists, create and append before body end
  const el = document.createElement('div');
  el.id = 'root';
  document.body.appendChild(el);
  const root = createRoot(el);
  root.render(<App />);
}
