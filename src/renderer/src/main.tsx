// React Core
import React from 'react'
import ReactDOM from 'react-dom/client'

// Reac Router
import { HashRouter as Router } from 'react-router-dom';

// Global Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'tippy.js/dist/tippy.css';
import './assets/main.css'

// User-Defined Components
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
)