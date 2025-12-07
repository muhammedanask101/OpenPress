import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../services/adminService';

const storedAdmin = JSON.parse(localStorage.getItem('admin'));

const initialState = {
  admin: storedAdmin ? storedAdmin : null, // { _id, name, email, token }
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// thunks

// Login
export const loginAdmin = createAsyncThunk(
  'admin/login',
  async (adminData, thunkAPI) => {
    try {
      return await adminService.login(adminData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout
export const logoutAdmin = createAsyncThunk('admin/logout', async () => {
  adminService.logout();
});

// Register new admin (requires existing admin token)
export const registerAdmin = createAsyncThunk(
  'admin/register',
  async (adminData, thunkAPI) => {
    try {
      return await adminService.register(adminData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get current admin details from backend
export const fetchCurrentAdmin = createAsyncThunk(
  'admin/fetchCurrent',
  async (_, thunkAPI) => {
    try {
      return await adminService.getCurrentAdmin();
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update current admin profile
export const updateAdminProfile = createAsyncThunk(
  'admin/updateProfile',
  async (updateData, thunkAPI) => {
    try {
      return await adminService.updateCurrentAdmin(updateData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Soft delete current admin
export const softDeleteAdminAccount = createAsyncThunk(
  'admin/softDelete',
  async (_, thunkAPI) => {
    try {
      return await adminService.softDeleteCurrentAdmin();
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// slices

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.admin = action.payload;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.admin = null;
      })

      // logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
      })

      // register admin
      .addCase(registerAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.admin = action.payload;
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // fetch current admin
      .addCase(fetchCurrentAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        // merge backend data into current admin object
        state.admin = {
          ...(state.admin || {}),
          ...action.payload, // { id, name, email }
        };
      })
      .addCase(fetchCurrentAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // update admin profile
      .addCase(updateAdminProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAdminProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.admin = action.payload; // new token + updated admin
      })
      .addCase(updateAdminProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // soft delete admin
      .addCase(softDeleteAdminAccount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(softDeleteAdminAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.admin = null; // treat as logged out on client
      })
      .addCase(softDeleteAdminAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = adminSlice.actions;
export default adminSlice.reducer;
