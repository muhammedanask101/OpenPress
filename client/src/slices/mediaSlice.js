import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";
import mediaService from "../services/mediaService";
import axios from "axios";

const initialState = {
  myMedia: [],
  myPagination: null,        // { page, limit, total }

  adminMedia: [],
  adminPagination: null,     // { page, limit, total }

  itemMedia: {},             // { [itemKey]: Media[] }   itemKey = `${kind}:${itemId}`
  currentMedia: null,
  mediaByKey: null,          // result from /by-key/search

  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

const makeItemKey = (kind, itemId) => `${kind}:${itemId}`;

// thunks

// USER: create media
export const createMedia = createAsyncThunk(
  "media/create",
  async (mediaData, thunkAPI) => {
    try {
      return await mediaService.createMedia(mediaData);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// USER: get my media
export const fetchMyMedia = createAsyncThunk(
  "media/fetchMyMedia",
  async (params = {}, thunkAPI) => {
    try {
      return await mediaService.getMyMedia(params);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// PUBLIC: get media for a specific item
export const fetchMediaForItem = createAsyncThunk(
  "media/fetchMediaForItem",
  async ({ kind, itemId }, thunkAPI) => {
    try {
      const items = await mediaService.getMediaForItem({ kind, itemId });
      return { kind, itemId, items };
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// PUBLIC: get media by id
export const fetchMediaById = createAsyncThunk(
  "media/fetchMediaById",
  async (id, thunkAPI) => {
    try {
      return await mediaService.getMediaById(id);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ADMIN: list media
export const adminFetchMedia = createAsyncThunk(
  "media/adminFetchMedia",
  async (params = {}, thunkAPI) => {
    try {
      return await mediaService.adminListMedia(params);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ADMIN: find by key + provider
export const adminGetMediaByKey = createAsyncThunk(
  "media/adminGetMediaByKey",
  async ({ key, provider }, thunkAPI) => {
    try {
      return await mediaService.getMediaByKey({ key, provider });
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ADMIN: soft delete
export const adminSoftDeleteMedia = createAsyncThunk(
  "media/adminSoftDeleteMedia",
  async (id, thunkAPI) => {
    try {
      return await mediaService.softDeleteMedia(id);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ADMIN: attach usage
export const attachMediaUsage = createAsyncThunk(
  "media/attachUsage",
  async ({ id, kind, itemId }, thunkAPI) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/media/${id}/attach`,
        { kind, itemId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);


// ADMIN: clear usage
export const adminClearMediaUsage = createAsyncThunk(
  "media/adminClearMediaUsage",
  async (id, thunkAPI) => {
    try {
      return await mediaService.clearMediaUsage(id);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// slices

export const mediaSlice = createSlice({
  name: "media",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    clearCurrentMedia: (state) => {
      state.currentMedia = null;
    },
    clearMediaByKey: (state) => {
      state.mediaByKey = null;
    },
    clearItemMedia: (state, action) => {
      const { kind, itemId } = action.payload || {};
      if (!kind || !itemId) {
        state.itemMedia = {};
      } else {
        const key = makeItemKey(kind, itemId);
        delete state.itemMedia[key];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // USER: create media
      .addCase(createMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const created = action.payload;
        // add to myMedia if we already have it loaded
        state.myMedia.unshift(created);
        if (state.myPagination) {
          state.myPagination.total = (state.myPagination.total || 0) + 1;
        }
      })

      // USER: get my media
      .addCase(fetchMyMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        state.myMedia = action.payload.items || [];
        state.myPagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })

      // PUBLIC: media for item
      .addCase(fetchMediaForItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const { kind, itemId, items } = action.payload;
        const key = makeItemKey(kind, itemId);
        state.itemMedia[key] = items || [];
      })

      // PUBLIC: media by id
      .addCase(fetchMediaById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentMedia = action.payload;
      })

      // ADMIN: list media
      .addCase(adminFetchMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        state.adminMedia = action.payload.items || [];
        state.adminPagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })

      // ADMIN: get media by key
      .addCase(adminGetMediaByKey.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.mediaByKey = action.payload;
      })

      // ADMIN: soft delete media
      .addCase(adminSoftDeleteMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const deleted = action.payload.media;
        if (!deleted) return;

        // remove from adminMedia
        state.adminMedia = state.adminMedia.filter(
          (m) => m.id !== deleted.id && m._id !== deleted._id
        );
        if (state.adminPagination && typeof state.adminPagination.total === "number") {
          state.adminPagination.total = Math.max(
            0,
            state.adminPagination.total - 1
          );
        }

        // remove from myMedia if present
        state.myMedia = state.myMedia.filter(
          (m) => m.id !== deleted.id && m._id !== deleted._id
        );

        // remove from any itemMedia lists
        Object.keys(state.itemMedia).forEach((key) => {
          state.itemMedia[key] = state.itemMedia[key].filter(
            (m) => m.id !== deleted.id && m._id !== deleted._id
          );
        });

        // clear currentMedia if it was this
        if (
          state.currentMedia &&
          (state.currentMedia.id === deleted.id ||
            state.currentMedia._id === deleted._id)
        ) {
          state.currentMedia = null;
        }
      })

      // ADMIN: attach usage
      .addCase(attachMediaUsage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const updated = action.payload.media;
        if (!updated) return;

        // update adminMedia list
        state.adminMedia = state.adminMedia.map((m) =>
          m.id === updated.id || m._id === updated._id ? updated : m
        );

        // update myMedia
        state.myMedia = state.myMedia.map((m) =>
          m.id === updated.id || m._id === updated._id ? updated : m
        );

        // update currentMedia
        if (
          state.currentMedia &&
          (state.currentMedia.id === updated.id ||
            state.currentMedia._id === updated._id)
        ) {
          state.currentMedia = updated;
        }
      })

      // ADMIN: clear usage
      .addCase(adminClearMediaUsage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const updated = action.payload.media;
        if (!updated) return;

        // update adminMedia list
        state.adminMedia = state.adminMedia.map((m) =>
          m.id === updated.id || m._id === updated._id ? updated : m
        );

        // update myMedia
        state.myMedia = state.myMedia.map((m) =>
          m.id === updated.id || m._id === updated._id ? updated : m
        );

        // update currentMedia
        if (
          state.currentMedia &&
          (state.currentMedia.id === updated.id ||
            state.currentMedia._id === updated._id)
        ) {
          state.currentMedia = updated;
        }
      })

      // PENDING (all thunks)
      .addMatcher(
        isPending(
          createMedia,
          fetchMyMedia,
          fetchMediaForItem,
          fetchMediaById,
          adminFetchMedia,
          adminGetMediaByKey,
          adminSoftDeleteMedia,
          attachMediaUsage,
          adminClearMediaUsage
        ),
        (state) => {
          state.isLoading = true;
          state.isError = false;
          state.message = "";
        }
      )

      // REJECTED
      .addMatcher(
        isRejected(
          createMedia,
          fetchMyMedia,
          fetchMediaForItem,
          fetchMediaById,
          adminFetchMedia,
          adminGetMediaByKey,
          adminSoftDeleteMedia,
          attachMediaUsage,
          adminClearMediaUsage
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
  clearCurrentMedia,
  clearMediaByKey,
  clearItemMedia,
} = mediaSlice.actions;

export default mediaSlice.reducer;
