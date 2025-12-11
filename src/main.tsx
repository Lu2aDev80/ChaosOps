import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/Colors.css'
import './styles/Gremlins.css'

import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx'
import { AuthProvider } from "./context/AuthContext";

  <StrictMode>
    <BrowserRouter basename="">
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
