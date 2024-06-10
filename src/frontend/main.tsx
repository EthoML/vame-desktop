import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Commoners
import * as commoners from './commoners'

// Global Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'tippy.js/dist/tippy.css';
import './index.css'

// Router
import { HashRouter as Router } from 'react-router-dom';
import { get } from './utils/requests.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
)



// ---------------------------------------------------------
// ---------------- Custom Commoners Callbacks -------------
// ---------------------------------------------------------

commoners.onActivityDetected(() => {
  console.log(`Checking Python server status...`)
  get('connected')
  .catch(() => console.error(`Python server is not active...`))
})

commoners.onConnected(() => {

  console.log(`Loading VAME library..`)

  get('ready')
  .then(() => console.log(`VAME is ready!`))
  .catch(() => console.error(`Failed to connect to VAME`))
})

commoners.onClosed(() => console.error(`Python server was closed!`))

 