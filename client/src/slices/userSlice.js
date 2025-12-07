import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../services/userService';

const localuser = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: localuser ? localuser : null, 
  viewedUser: null,                   
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// register and login thunks

export const registerUser = createAsyncThunk(
  'user/register',
  async (userData, thunkAPI) => {
    try {
      return await userService.register(userData);
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

export const loginUser = createAsyncThunk(
  'user/login',
  async (userData, thunkAPI) => {
    try {
      return await userService.login(userData);
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

export const logoutUser = createAsyncThunk('user/logout', async () => {
  userService.logout();
});

// user thunks

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrent',
  async (_, thunkAPI) => {
    try {
      return await userService.getCurrentUser();
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

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (updateData, thunkAPI) => {
    try {
      return await userService.updateUser(updateData);
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

export const softDeleteAccount = createAsyncThunk(
  'user/softDelete',
  async (_, thunkAPI) => {
    try {
      return await userService.softDeleteSelf();
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

// thunks of admin and profile

export const fetchUserById = createAsyncThunk(
  'user/fetchById',
  async (id, thunkAPI) => {
    try {
      return await userService.getUserById(id);
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

export const banUser = createAsyncThunk(
  'user/banUser',
  async (id, thunkAPI) => {
    try {
      return await userService.banUser(id);
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

export const unbanUser = createAsyncThunk(
  'user/unbanUser',
  async (id, thunkAPI) => {
    try {
      return await userService.unbanUser(id);
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

export const resetUserSecurity = createAsyncThunk(
  'user/resetSecurity',
  async (id, thunkAPI) => {
    try {
      return await userService.resetUserSecurity(id);
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

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearViewedUser: (state) => {
      state.viewedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })

      // login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })

      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.viewedUser = null;
      })

      // fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Option 1: merge current user details into state.user
        state.user = {
          ...(state.user || {}),
          ...action.payload,
        };
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // soft delete account
      .addCase(softDeleteAccount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(softDeleteAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        // After soft delete, treat as logged out
        state.user = null;
      })
      .addCase(softDeleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // fetch user by id (admin/profile)
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.viewedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.viewedUser = null;
      })

      // ban user
      .addCase(banUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(banUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // if we’re viewing that user, update viewedUser.banned
        if (state.viewedUser && state.viewedUser._id === action.payload.user._id) {
          state.viewedUser = {
            ...state.viewedUser,
            banned: action.payload.user.banned,
          };
        }
      })
      .addCase(banUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // unban user
      .addCase(unbanUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(unbanUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (state.viewedUser && state.viewedUser._id === action.payload.user._id) {
          state.viewedUser = {
            ...state.viewedUser,
            banned: action.payload.user.banned,
          };
        }
      })
      .addCase(unbanUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // reset user security
      .addCase(resetUserSecurity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetUserSecurity.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(resetUserSecurity.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearViewedUser } = userSlice.actions;
export default userSlice.reducer;
