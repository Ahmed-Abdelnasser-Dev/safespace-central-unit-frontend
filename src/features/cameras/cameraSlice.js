import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { streamApi } from '../../services/streamApi';

export const fetchCameras = createAsyncThunk(
  'cameras/fetchCameras',
  async (_, { rejectWithValue }) => {
    try {
      const data = await streamApi.getCameras();
      return data;
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
      });
  },
});

export default cameraSlice.reducer;
