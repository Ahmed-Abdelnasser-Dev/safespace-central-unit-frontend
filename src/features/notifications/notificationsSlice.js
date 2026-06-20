/**
 * Notifications Slice
 *
 * Manages persisted notification history and live socket-pushed alerts.
 * Items arrive from two sources:
 *   1. fetchNotifications thunk — backend-persisted history (survives refresh)
 *   2. addLiveNotification action — socket events prepended in real-time
 *
 * @module features/notifications/notificationsSlice
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { observerAPI } from '@/services/api.js';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await observerAPI.listNotifications(params);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? err.message);
    }
  }
);

export const markRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await observerAPI.markNotificationRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? err.message);
    }
  }
);

export const markAllRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await observerAPI.markAllNotificationsRead();
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? err.message);
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    /** @type {Array<{id: string, type: string, title: string, message: string, severity?: string, timestamp: string, read: boolean, payload: object}>} */
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    /**
     * Prepend a live socket notification. Kept to max 100 items.
     * Immutably returns a new state object.
     */
    addLiveNotification(state, action) {
      return {
        ...state,
        items: [action.payload, ...state.items].slice(0, 100),
        unreadCount: state.unreadCount + 1,
      };
    },
    clearNotifications() {
      return { items: [], unreadCount: 0, loading: false, error: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => ({
        ...state,
        loading: true,
        error: null,
      }))
      .addCase(fetchNotifications.fulfilled, (state, action) => ({
        ...state,
        loading: false,
        items: action.payload.notifications ?? [],
        unreadCount: action.payload.meta?.unreadCount ?? 0,
      }))
      .addCase(fetchNotifications.rejected, (state, action) => ({
        ...state,
        loading: false,
        error: action.payload,
      }))
      .addCase(markRead.fulfilled, (state, action) => ({
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload ? { ...item, read: true } : item
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
      .addCase(markAllRead.fulfilled, (state) => ({
        ...state,
        items: state.items.map((item) => ({ ...item, read: true })),
        unreadCount: 0,
      }));
  },
});

export const { addLiveNotification, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
