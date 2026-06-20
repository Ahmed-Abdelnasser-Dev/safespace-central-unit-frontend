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
import camerasReducer from '../features/cameras/cameraSlice.js';
import dispatcherReducer from '../features/emergencyDispatcher/dispatcherSlice.js';

export const store = configureStore({
  reducer: {
    nodes: nodesReducer,
    auth: authReducer,
    cameras: camerasReducer,
    dispatcher: dispatcherReducer,
  },
});

export default store;
