/**
 * Safe Space Monitoring Dashboard - Application Entry Point
 * 
 * This file is the entry point for the React application.
 * It renders the root App component into the DOM.
 * 
 * @module main
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './app/store.js';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import './index.css';
import './icons.js';
import 'bootstrap-icons/font/bootstrap-icons.css';


if (import.meta.env.DEV) window.__STORE__ = store;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <App />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
