import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";
import badgeService from "../services/badgeService";

const initialState = {
  badges: [],          // all badges (public/admin list)
  currentBadge: null,  // single badge
  userBadges: [],      // BadgeOf docs for selected user
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// thunks

// Public: list badges (optional includeDeleted)
export const fetchBadges = createAsyncThunk(
  "badges/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      return await badgeService.getBadges(params);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Public: get badge by id
export const fetchBadgeById = createAsyncThunk(
  "badges/fetchById",
  async ({ id, params = {} }, thunkAPI) => {
    try {
      return await badgeService.getBadgeById(id, params);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Public: get all badges for a user (BadgeOf list)
export const fetchUserBadges = createAsyncThunk(
  "badges/fetchUserBadges",
  async (userId, thunkAPI) => {
    try {
      return await badgeService.getUserBadges(userId);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Admin: create badge
export const createBadge = createAsyncThunk(
  "badges/create",
  async (badgeData, thunkAPI) => {
    try {
      return await badgeService.createBadge(badgeData);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Admin: update badge
export const updateBadge = createAsyncThunk(
  "badges/update",
  async ({ id, badgeData }, thunkAPI) => {
    try {
      return await badgeService.updateBadge(id, badgeData);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Admin: soft delete badge
export const deleteBadge = createAsyncThunk(
  "badges/delete",
  async (id, thunkAPI) => {
    try {
      return await badgeService.deleteBadge(id);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Admin: restore soft-deleted badge
export const restoreBadge = createAsyncThunk(
  "badges/restore",
  async (id, thunkAPI) => {
    try {
      return await badgeService.restoreBadge(id);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Admin: configure auto-award
export const setBadgeAutoAward = createAsyncThunk(
  "badges/setAutoAward",
  async ({ id, autoAwardData }, thunkAPI) => {
    try {
      return await badgeService.setAutoAward(id, autoAwardData);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Admin: award badge to a user
export const awardBadgeToUser = createAsyncThunk(
  "badges/awardToUser",
  async (awardData, thunkAPI) => {
    try {
      // awardData: { user, badge, reason? }
      return await badgeService.awardBadgeToUser(awardData);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Admin: revoke awarded badge (BadgeOf id)
export const revokeBadgeAward = createAsyncThunk(
  "badges/revokeAward",
  async (id, thunkAPI) => {
    try {
      return await badgeService.revokeBadgeAward(id);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// slices

export const badgeSlice = createSlice({
  name: "badges",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    clearCurrentBadge: (state) => {
      state.currentBadge = null;
    },
    clearUserBadges: (state) => {
      state.userBadges = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all badges
      .addCase(fetchBadges.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.badges = action.payload || [];
      })

      // fetch badge by id
      .addCase(fetchBadgeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentBadge = action.payload;
      })

      // fetch user badges
      .addCase(fetchUserBadges.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userBadges = action.payload || [];
      })

      // create badge
      .addCase(createBadge.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.badges.push(action.payload);
      })

      // update badge
      .addCase(updateBadge.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updated = action.payload;

        state.badges = state.badges.map((b) =>
          b.id === updated.id || b._id === updated._id ? updated : b
        );

        if (
          state.currentBadge &&
          (state.currentBadge.id === updated.id ||
            state.currentBadge._id === updated._id)
        ) {
          state.currentBadge = updated;
        }
      })

      // soft delete badge
      .addCase(deleteBadge.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const updated = action.payload.badge;
        if (updated) {
          state.badges = state.badges.map((b) =>
            b.id === updated.id || b._id === updated._id ? updated : b
          );
          if (
            state.currentBadge &&
            (state.currentBadge.id === updated.id ||
              state.currentBadge._id === updated._id)
          ) {
            state.currentBadge = updated;
          }
        }
      })

      // restore badge
      .addCase(restoreBadge.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const updated = action.payload.badge;
        if (updated) {
          state.badges = state.badges.map((b) =>
            b.id === updated.id || b._id === updated._id ? updated : b
          );
          if (
            state.currentBadge &&
            (state.currentBadge.id === updated.id ||
              state.currentBadge._id === updated._id)
          ) {
            state.currentBadge = updated;
          }
        }
      })

      // set auto-award
      .addCase(setBadgeAutoAward.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const updated = action.payload.badge;
        if (updated) {
          state.badges = state.badges.map((b) =>
            b.id === updated.id || b._id === updated._id ? updated : b
          );
          if (
            state.currentBadge &&
            (state.currentBadge.id === updated.id ||
              state.currentBadge._id === updated._id)
          ) {
            state.currentBadge = updated;
          }
        }
      })

      // award badge to user (BadgeOf)
      .addCase(awardBadgeToUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const awarded = action.payload; // BadgeOf doc
        state.userBadges.unshift(awarded);
      })

      // revoke badge award
      .addCase(revokeBadgeAward.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const revokedId = action.payload.id;
        state.userBadges = state.userBadges.filter(
          (bo) => bo.id !== revokedId && bo._id !== revokedId
        );
      })

      // common pending
      .addMatcher(
        isPending(
          fetchBadges,
          fetchBadgeById,
          fetchUserBadges,
          createBadge,
          updateBadge,
          deleteBadge,
          restoreBadge,
          setBadgeAutoAward,
          awardBadgeToUser,
          revokeBadgeAward
        ),
        (state) => {
          state.isLoading = true;
          state.isError = false;
          state.message = "";
        }
      )

      // common rejected
      .addMatcher(
        isRejected(
          fetchBadges,
          fetchBadgeById,
          fetchUserBadges,
          createBadge,
          updateBadge,
          deleteBadge,
          restoreBadge,
          setBadgeAutoAward,
          awardBadgeToUser,
          revokeBadgeAward
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
  clearCurrentBadge,
  clearUserBadges,
} = badgeSlice.actions;

export default badgeSlice.reducer;
