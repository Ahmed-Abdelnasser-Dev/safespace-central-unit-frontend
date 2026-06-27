/**
 * Nodes Feature Slice
 * 
 * Redux Toolkit slice for managing node data, selection, and configuration state.
 * This handles the central state for all node-related operations.
 * 
 * @module features/nodeMaintainer/nodesSlice
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { nodeAPI } from '../../services/api';

const initialState = {
  nodes: [],
  selectedNodeId: null,
  currentTab: 'overview', // 'overview', 'lanes', 'health', 'config', 'cameras'
  isLoading: false,
  error: null,
};

const createDefaultRoadRules = () => ({ lanes: [], speedLimit: 0 });

const normalizeNode = (node) => {
  const nodeId = node.nodeId || node.id;
  const roadRules = {
    ...createDefaultRoadRules(),
    ...(node.roadRules || {}),
  };
  const lanes = Array.isArray(roadRules.lanes) ? roadRules.lanes : [];
  const existingPolygons = Array.isArray(node.lanePolygons) ? node.lanePolygons : [];
  const location = node.location || {
    latitude: typeof node.latitude === 'number' ? node.latitude : 0,
    longitude: typeof node.longitude === 'number' ? node.longitude : 0,
    address: node.streetName || 'Unknown location',
  };
  
  // Sync polygons with lanes: ensure each lane has a polygon (can be empty)
  const syncedPolygons = lanes.map(lane => {
    const existingPolygon = existingPolygons.find(p => p.laneNumber === lane.id);
    if (existingPolygon) {
      return existingPolygon;
    }
    // Create empty placeholder for lane without polygon
    return {
      id: `poly-${Date.now()}-${lane.id}`,
      name: lane.name,
      laneNumber: lane.id,
      type: 'lane',
      points: [],
      baseWidth: 0,
      baseHeight: 0,
      isEmpty: true,
    };
  });
  
  return {
    id: nodeId,
    nodeId,
    name: node.name || nodeId,
    status: node.status || 'offline',
    location,
    roadRules: roadRules,
    nodeSpecs: node.nodeSpecs || {},
    health: node.health || {
      cpu: 0,
      temperature: 0,
      memory: 0,
      network: 0,
      storage: 0,
      currentFps: 0,
    },
    lanePolygons: syncedPolygons,
    defaultLaneCount: node.defaultLaneCount || lanes.length || 1,
    speedLimit: node.speedLimit || 80,
    streetName: node.streetName || location.address || 'Unknown location',
    ipAddress: node.ipAddress || '0.0.0.0',
    latitude: typeof node.latitude === 'number' ? node.latitude : location.latitude || 0,
    longitude: typeof node.longitude === 'number' ? node.longitude : location.longitude || 0,
    videoFeedUrl: node.videoFeedUrl || '',
    frameRate: node.frameRate || 30,
    resolution: node.resolution || '1920x1080',
    uptimeSec: node.uptimeSec || 0,
    firmwareVersion: node.firmwareVersion || 'unknown',
    modelVersion: node.modelVersion || 'unknown',
    lastHeartbeat: node.lastHeartbeat || null,
    lastUpdate: node.lastUpdate || new Date().toISOString(),
    createdAt: node.createdAt || null,
    updatedAt: node.updatedAt || null,
  };
};

export const fetchNodes = createAsyncThunk('nodes/fetchNodes', async (_, thunkApi) => {
  try {
    return await nodeAPI.getNodes();
  } catch (error) {
    return thunkApi.rejectWithValue(error?.response?.data?.message || 'Failed to fetch nodes');
  }
});

export const registerNode = createAsyncThunk('nodes/registerNode', async (payload, thunkApi) => {
  try {
    await nodeAPI.registerNode(payload);
    return await nodeAPI.getNodes(); // re-fetch full list
  } catch (error) {
    return thunkApi.rejectWithValue(error?.response?.data?.message || 'Failed to register node');
  }
});

export const updateNodePolygons = createAsyncThunk('nodes/updateNodePolygons', async ({ nodeId, lanePolygons }, thunkApi) => {
  try {
    return await nodeAPI.updateNodePolygons(nodeId, lanePolygons);
  } catch (error) {
    return thunkApi.rejectWithValue(error?.response?.data?.message || 'Failed to update polygons');
  }
});

export const deleteNode = createAsyncThunk('nodes/deleteNode', async (nodeId, thunkApi) => {
  try {
    await nodeAPI.deleteNode(nodeId);
    return nodeId;
  } catch (error) {
    return thunkApi.rejectWithValue(error?.response?.data?.message || 'Failed to delete node');
  }
});

/**
 * Update node configuration (name, IP, location, camera settings, etc.)
 * @param {Object} payload - { nodeId, updates }
 */
export const updateNode = createAsyncThunk('nodes/updateNode', async ({ nodeId, updates }, thunkApi) => {
  try {
    return await nodeAPI.updateNode(nodeId, updates);
  } catch (error) {
    return thunkApi.rejectWithValue(error?.response?.data?.message || 'Failed to update node');
  }
});

/**
 * Persist road config (lanes + speedLimit) to the API.
 * Applies optimistic update locally first; rolls back on API failure.
 */
export const persistRoadConfig = createAsyncThunk(
  'nodes/persistRoadConfig',
  async ({ nodeId, lanes, speedLimit }, thunkApi) => {
    try {
      const result = await nodeAPI.updateRoadConfig(nodeId, { lanes, speedLimit });
      return result; // may be null if backend returns 204
    } catch (error) {
      return thunkApi.rejectWithValue(error?.response?.data?.message || 'Failed to save road configuration');
    }
  }
);

/**
 * Persist node specs (camera/network/detection params) to the API.
 * Applies optimistic update locally first; rolls back on API failure.
 */
export const persistNodeSpecs = createAsyncThunk(
  'nodes/persistNodeSpecs',
  async ({ nodeId, specs }, thunkApi) => {
    try {
      const result = await nodeAPI.updateNode(nodeId, { nodeSpecs: specs });
      return result;
    } catch (error) {
      return thunkApi.rejectWithValue(error?.response?.data?.message || 'Failed to save node configuration');
    }
  }
);

/**
 * Persist node status (active/inactive) to the API.
 * Applies optimistic update locally first; rolls back on API failure.
 */
export const persistNodeStatus = createAsyncThunk(
  'nodes/persistNodeStatus',
  async ({ nodeId, status }, thunkApi) => {
    try {
      const result = await nodeAPI.updateNode(nodeId, { status });
      return result;
    } catch (error) {
      return thunkApi.rejectWithValue(error?.response?.data?.message || 'Failed to update node status');
    }
  }
);

const nodesSlice = createSlice({
  name: 'nodes',
  initialState,
  reducers: {
    selectNode(state, action) {
      state.selectedNodeId = action.payload;
      state.currentTab = 'overview'; // Reset to overview when selecting a new node
    },

    setCurrentTab(state, action) {
      state.currentTab = action.payload;
    },

    addNode(state, action) {
      state.nodes.unshift(normalizeNode(action.payload));
    },

    updateNodeRoadRules(state, action) {
      const { nodeId, roadRules } = action.payload;
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        node.roadRules = {
          ...createDefaultRoadRules(),
          ...(node.roadRules || {}),
          ...roadRules,
        };
        if (!Array.isArray(node.roadRules.lanes)) {
          node.roadRules.lanes = [];
        }
      }
    },

    updateNodeSpecs(state, action) {
      const { nodeId, specs } = action.payload;
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        node.nodeSpecs = { ...node.nodeSpecs, ...specs };
      }
    },

    updateNodeStatus(state, action) {
      const { nodeId, status } = action.payload;
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        node.status = status;
        node.lastUpdate = new Date().toISOString();
      }
    },

    updateLaneStatus(state, action) {
      const { nodeId, laneId, status } = action.payload;
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        if (!node.roadRules) {
          node.roadRules = createDefaultRoadRules();
        }
        if (!Array.isArray(node.roadRules.lanes)) {
          node.roadRules.lanes = [];
        }
        const lane = node.roadRules.lanes.find(l => l.id === laneId);
        if (lane) {
          lane.status = status;
        }
      }
    },

    addLane(state, action) {
      const { nodeId, lane } = action.payload;
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        if (!node.roadRules) {
          node.roadRules = createDefaultRoadRules();
        }
        if (!Array.isArray(node.roadRules.lanes)) {
          node.roadRules.lanes = [];
        }
        if (!Array.isArray(node.lanePolygons)) {
          node.lanePolygons = [];
        }
        node.roadRules.lanes.push(lane);
        // Auto-create empty polygon placeholder for this lane
        const polygonExists = node.lanePolygons.some(p => p.laneNumber === lane.id);
        if (!polygonExists) {
          node.lanePolygons.push({
            id: `poly-${Date.now()}-${lane.id}`,
            name: lane.name,
            laneNumber: lane.id,
            type: 'lane',
            points: [],
            baseWidth: 0,
            baseHeight: 0,
            isEmpty: true,
          });
        }
      }
    },

    removeLane(state, action) {
      const { nodeId, laneId } = action.payload;
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        if (!node.roadRules) {
          node.roadRules = createDefaultRoadRules();
        }
        if (!Array.isArray(node.roadRules.lanes)) {
          node.roadRules.lanes = [];
        }
        if (!Array.isArray(node.lanePolygons)) {
          node.lanePolygons = [];
        }
        node.roadRules.lanes = node.roadRules.lanes.filter(l => l.id !== laneId);
        // Remove associated polygon when lane is deleted
        node.lanePolygons = node.lanePolygons.filter(p => p.laneNumber !== laneId);
      }
    },

    addLanePolygon(state, action) {
      const { nodeId, polygon } = action.payload;
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        node.lanePolygons.push(polygon);
      }
    },

    updateLanePolygon(state, action) {
      const { nodeId, polygonId, polygon } = action.payload;
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        const idx = node.lanePolygons.findIndex(p => p.id === polygonId);
        if (idx !== -1) {
          node.lanePolygons[idx] = polygon;
        }
      }
    },

    deleteLanePolygon(state, action) {
      const { nodeId, polygonId } = action.payload;
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        node.lanePolygons = node.lanePolygons.filter(p => p.id !== polygonId);
      }
    },

    updateNodeHealth(state, action) {
      const { nodeId, health } = action.payload;
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        node.health = { ...node.health, ...health };
      }
    },

    updateNodeFromHeartbeat(state, action) {
      const { 
        nodeId, 
        status, 
        health = {}, 
        timestamp, 
        uptimeSec, 
        firmwareVersion, 
        modelVersion,
        // New telemetry fields
        frameRate,
        resolution,
        sensitivity,
        minObjectSize,
        bandwidth,
        cpu,
        temperature,
        memory,
        network,
        storage,
        latitude,
        longitude,
        ipAddress,
        videoFeedUrl,
        lanes,
        laneStatus,
        speedLimit,
        streetName,
      } = action.payload;
      
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        node.status = status;
        node.health = { ...node.health, ...health };
        node.lastHeartbeat = timestamp;
        node.uptimeSec = uptimeSec || node.uptimeSec;
        node.firmwareVersion = firmwareVersion || node.firmwareVersion;
        node.modelVersion = modelVersion || node.modelVersion;
        
        // Update new telemetry fields if provided
        if (frameRate !== undefined) node.frameRate = frameRate;
        if (resolution !== undefined) node.resolution = resolution;
        if (sensitivity !== undefined) node.sensitivity = sensitivity;
        if (minObjectSize !== undefined) node.minObjectSize = minObjectSize;
        if (bandwidth !== undefined) node.bandwidth = bandwidth;
        if (cpu !== undefined) node.cpu = cpu;
        if (temperature !== undefined) node.temperature = temperature;
        if (memory !== undefined) node.memory = memory;
        if (network !== undefined) node.network = network;
        if (storage !== undefined) node.storage = storage;
        if (latitude !== undefined) node.latitude = latitude;
        if (longitude !== undefined) node.longitude = longitude;
        if (ipAddress !== undefined) node.ipAddress = ipAddress;
        if (videoFeedUrl !== undefined) node.videoFeedUrl = videoFeedUrl;
        if (lanes !== undefined) node.lanes = lanes;
        if (laneStatus !== undefined) node.laneStatus = laneStatus;
        if (speedLimit !== undefined) node.speedLimit = speedLimit;
        if (streetName !== undefined) node.streetName = streetName;
        
        node.lastUpdate = new Date().toISOString();
      }
    },

    markNodeOffline(state, action) {
      const { nodeId } = action.payload;
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        console.warn(`Marking node ${nodeId} OFFLINE (no heartbeat for 60+ seconds)`);
        node.status = 'offline';
        node.health = {
          cpu: 0,
          temperature: 0,
          memory: 0,
          network: 0,
          storage: 0,
          currentFps: 0,
        };
        node.uptimeSec = 0;
        node.lastUpdate = new Date().toISOString();
      }
    },

    setLoading(state, action) {
      state.isLoading = action.payload;
    },

    setError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNodes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNodes.fulfilled, (state, action) => {
        state.isLoading = false;
        const normalized = action.payload.map(normalizeNode);
        state.nodes = normalized;

        if (normalized.length === 0) {
          state.selectedNodeId = null;
        } else if (!state.selectedNodeId || !normalized.some(n => n.id === state.selectedNodeId)) {
          state.selectedNodeId = normalized[0].id;
        }
      })
      .addCase(fetchNodes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch nodes';
      })
      .addCase(registerNode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerNode.fulfilled, (state, action) => {
        state.isLoading = false;
        const normalized = action.payload.map(normalizeNode);
        state.nodes = normalized;

        if (normalized.length === 0) {
          state.selectedNodeId = null;
        } else if (!state.selectedNodeId || !normalized.some(n => n.id === state.selectedNodeId)) {
          state.selectedNodeId = normalized[0].id;
        }
      })
      .addCase(registerNode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to register node';
      })
      .addCase(updateNodePolygons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNodePolygons.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload != null) {
          const updated = normalizeNode(action.payload);
          const idx = state.nodes.findIndex(n => n.id === updated.id);
          if (idx !== -1) {
            state.nodes[idx] = updated;
          }
        }
      })
      .addCase(updateNodePolygons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update polygons';
      })
      .addCase(deleteNode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNode.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedNodeId = action.payload;
        state.nodes = state.nodes.filter((node) => node.id !== deletedNodeId);

        if (state.selectedNodeId === deletedNodeId) {
          state.selectedNodeId = state.nodes[0]?.id || null;
          state.currentTab = 'overview';
        }
      })
      .addCase(deleteNode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete node';
      })
      .addCase(updateNode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNode.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = normalizeNode(action.payload);
        const idx = state.nodes.findIndex(n => n.id === updated.id);
        if (idx !== -1) {
          state.nodes[idx] = updated;
        }
      })
      .addCase(updateNode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update node';
      })
      .addCase(persistRoadConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(persistRoadConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload != null) {
          const updated = normalizeNode(action.payload);
          const idx = state.nodes.findIndex(n => n.id === updated.id);
          if (idx !== -1) {
            state.nodes[idx] = updated;
          }
        }
      })
      .addCase(persistRoadConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to save road configuration';
      })
      .addCase(persistNodeSpecs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(persistNodeSpecs.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload != null) {
          const updated = normalizeNode(action.payload);
          const idx = state.nodes.findIndex(n => n.id === updated.id);
          if (idx !== -1) {
            state.nodes[idx] = updated;
          }
        }
      })
      .addCase(persistNodeSpecs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to save node configuration';
      })
      .addCase(persistNodeStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(persistNodeStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload != null) {
          const updated = normalizeNode(action.payload);
          const idx = state.nodes.findIndex(n => n.id === updated.id);
          if (idx !== -1) {
            state.nodes[idx] = updated;
          }
        }
      })
      .addCase(persistNodeStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update node status';
      });
  },
});

export const {
  selectNode,
  setCurrentTab,
  addNode,
  updateNodeRoadRules,
  updateNodeSpecs,
  updateNodeStatus,
  updateLaneStatus,
  addLane,
  removeLane,
  addLanePolygon,
  updateLanePolygon,
  deleteLanePolygon,
  updateNodeHealth,
  updateNodeFromHeartbeat,
  markNodeOffline,
  setLoading,
  setError,
} = nodesSlice.actions;

// Selectors
export const selectAllNodes = (state) => state.nodes.nodes;
export const selectSelectedNodeId = (state) => state.nodes.selectedNodeId;
export const selectSelectedNode = (state) =>
  state.nodes.nodes.find(n => n.id === state.nodes.selectedNodeId);
export const selectCurrentTab = (state) => state.nodes.currentTab;
export const selectNodesLoading = (state) => state.nodes.isLoading;
export const selectNodesError = (state) => state.nodes.error;

export default nodesSlice.reducer;
