import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './api/axiosConfig'   // register global axios interceptor (Bearer token)
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
