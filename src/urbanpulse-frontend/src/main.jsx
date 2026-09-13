/**
 * Project Name: UrbanPulse
 * Group Name: Vision Crafters
 * Author(s): Ashish Pant, Sneha Kesharwani
 * Date of Last Modification: 13 September 2026
 * Brief Description: Initializes the UrbanPulse React application and renders it into the root DOM element.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
