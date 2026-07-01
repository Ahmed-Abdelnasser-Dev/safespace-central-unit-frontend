import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { streamApi } from '../../services/streamApi';
import api from '../../services/api';

// Camera list comes from the main backend (which syncs with stream-service for health)
export const fetchCameras = createAsyncThunk(
  'cameras/fetchCameras',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/cameras');
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// CRUD goes through the backend API (persists to DB + syncs stream-service)
export const createCamera = createAsyncThunk(
  'cameras/createCamera',
  async (cameraData, { rejectWithValue }) => {
    try {
      const res = await api.post('/cameras', cameraData);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateCamera = createAsyncThunk(
  'cameras/updateCamera',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/cameras/${id}`, data);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteCamera = createAsyncThunk(
  'cameras/deleteCamera',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/cameras/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const cameraSlice = createSlice({
  name: 'cameras',
  initialState: {
    cameras: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCameras.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCameras.fulfilled, (state, action) => {
        state.loading = false;
        state.cameras = action.payload;
      })
      .addCase(fetchCameras.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCamera.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createCamera.fulfilled, (state, action) => {
        state.submitting = false;
        state.cameras.push(action.payload);
      })
      .addCase(createCamera.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(updateCamera.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateCamera.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.cameras.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.cameras[index] = action.payload;
      })
      .addCase(updateCamera.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(deleteCamera.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteCamera.fulfilled, (state, action) => {
        state.submitting = false;
        state.cameras = state.cameras.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCamera.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export default cameraSlice.reducer;
