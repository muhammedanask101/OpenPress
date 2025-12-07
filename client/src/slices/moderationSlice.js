import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";
import moderationService from "../services/moderationService";

const makeItemKey = (itemType, itemId) => `${itemType}:${itemId}`;

const initialState = {
  // main list
  logs: [],
  pagination: null,           // { page, limit, total }

  // per item logs
  itemLogs: {},               // { [itemKey]: { itemType, itemId, count, logs } }

  // per actor logs
  actorLogs: {},              // { [actorId]: { actor, count, logs } }

  // single entry
  currentLog: null,

  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// thunks

// List/filter moderation logs
export const fetchModLogs = createAsyncThunk(
  "moderation/fetchModLogs",
  async (params = {}, thunkAPI) => {
    try {
      return await moderationService.getModLogs(params);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Logs for specific item
export const fetchLogsForItem = createAsyncThunk(
  "moderation/fetchLogsForItem",
  async ({ itemType, itemId, limit }, thunkAPI) => {
    try {
      return await moderationService.getLogsForItem({ itemType, itemId, limit });
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Logs for specific actor
export const fetchLogsForActor = createAsyncThunk(
  "moderation/fetchLogsForActor",
  async ({ actorId, itemType, limit }, thunkAPI) => {
    try {
      return await moderationService.getLogsForActor({
        actorId,
        itemType,
        limit,
      });
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Single log entry
export const fetchModLogById = createAsyncThunk(
  "moderation/fetchModLogById",
  async (id, thunkAPI) => {
    try {
      return await moderationService.getModLogById(id);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// slices

export const moderationSlice = createSlice({
  name: "moderation",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    clearCurrentLog: (state) => {
      state.currentLog = null;
    },
    clearItemLogs: (state, action) => {
      const { itemType, itemId } = action.payload || {};
      if (!itemType || !itemId) {
        state.itemLogs = {};
      } else {
        const key = makeItemKey(itemType, itemId);
        delete state.itemLogs[key];
      }
    },
    clearActorLogs: (state, action) => {
      const { actorId } = action.payload || {};
      if (!actorId) {
        state.actorLogs = {};
      } else {
        delete state.actorLogs[actorId];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // MAIN LIST
      .addCase(fetchModLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        state.logs = action.payload.logs || [];
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })

      // ITEM LOGS
      .addCase(fetchLogsForItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const { itemType, itemId, count, logs } = action.payload;
        const key = makeItemKey(itemType, itemId);
        state.itemLogs[key] = { itemType, itemId, count, logs };
      })

      // ACTOR LOGS
      .addCase(fetchLogsForActor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const { actor, count, logs } = action.payload;
        state.actorLogs[actor] = { actor, count, logs };
      })

      // SINGLE LOG
      .addCase(fetchModLogById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentLog = action.payload;
      })

      // PENDING for all thunks
      .addMatcher(
        isPending(
          fetchModLogs,
          fetchLogsForItem,
          fetchLogsForActor,
          fetchModLogById
        ),
        (state) => {
          state.isLoading = true;
          state.isError = false;
          state.message = "";
        }
      )

      // REJECTED for all thunks
      .addMatcher(
        isRejected(
          fetchModLogs,
          fetchLogsForItem,
          fetchLogsForActor,
          fetchModLogById
        ),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const {
  reset,
  clearCurrentLog,
  clearItemLogs,
  clearActorLogs,
} = moderationSlice.actions;

export default moderationSlice.reducer;
