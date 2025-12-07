import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";
import sitesettingsService from "../services/sitesettingsService";

const initialState = {
  publicSettings: null, // sanitized, no bannedKeywords etc.
  adminSettings: null,  // full settings (admin view)

  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// thunks

// Public settings (no auth)
export const fetchPublicSettings = createAsyncThunk(
  "sitesettings/fetchPublic",
  async (_, thunkAPI) => {
    try {
      return await sitesettingsService.getPublicSettings();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: full settings
export const fetchAdminSettings = createAsyncThunk(
  "sitesettings/fetchAdmin",
  async (_, thunkAPI) => {
    try {
      return await sitesettingsService.getAdminSettings();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: update settings (PATCH)
export const updateSiteSettings = createAsyncThunk(
  "sitesettings/update",
  async (updates, thunkAPI) => {
    try {
      return await sitesettingsService.updateSiteSettings(updates);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// slices

export const sitesettingsSlice = createSlice({
  name: "sitesettings",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    clearAdminSettings: (state) => {
      state.adminSettings = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // public fetch
      .addCase(fetchPublicSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.publicSettings = action.payload;
      })

      // admin fetch
      .addCase(fetchAdminSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.adminSettings = action.payload;
      })

      // admin update
      .addCase(updateSiteSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // backend returns full settings doc
        state.adminSettings = action.payload;
      })

      // pending for any of these thunks
      .addMatcher(
        isPending(
          fetchPublicSettings,
          fetchAdminSettings,
          updateSiteSettings
        ),
        (state) => {
          state.isLoading = true;
          state.isError = false;
          state.message = "";
        }
      )

      // rejected for any of these thunks
      .addMatcher(
        isRejected(
          fetchPublicSettings,
          fetchAdminSettings,
          updateSiteSettings
        ),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const { reset, clearAdminSettings } = sitesettingsSlice.actions;
export default sitesettingsSlice.reducer;
