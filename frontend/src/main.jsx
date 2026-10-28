import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import { RegionPricingProvider } from './RegionPricingContext.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <RegionPricingProvider>
          <App />
        </RegionPricingProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);