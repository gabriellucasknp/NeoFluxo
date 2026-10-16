import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { testConnection } from './firebase/config';

// Test connection on boot
testConnection().catch((err) => console.warn('Firestore test connection error:', err));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

