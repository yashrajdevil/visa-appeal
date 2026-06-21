import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CustomerAuthProvider>
      <App />
    </CustomerAuthProvider>
  </StrictMode>,
);
