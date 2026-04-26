/**
 * Redux Store Configuration
 * 
 * Configures the Redux Toolkit store with all feature slices.
 * This is the central state management hub for the application.
 * 
 * @module app/store
 */

import { configureStore } from '@reduxjs/toolkit';
import nodesReducer from '../features/nodeMaintainer/nodesSlice.js';
import authReducer from '../features/auth/authSlice.js';

export const store = configureStore({
  reducer: {
    nodes: nodesReducer,
    auth: authReducer, 
  },
});

export default store;
