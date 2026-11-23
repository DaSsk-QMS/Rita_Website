import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SiteProvider } from './context/SiteContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SiteProvider>
        <AuthProvider>
          <App />
          <Toaster position="top-right" toastOptions={{ style: { borderRadius: 12, fontSize: 14 } }} />
        </AuthProvider>
      </SiteProvider>
    </BrowserRouter>
  </StrictMode>
);
