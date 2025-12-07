import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";

import engagementService from "../services/engagementService";

const makeItemKey = (itemType, itemId) => `${itemType}:${itemId}`;

const initialState = {
  bookmarks: [],            // current user's bookmarks list
  bookmarksPage: null,      // pagination info
  bookmarkStatus: {},       // { [itemKey]: boolean }
  starStatus: {},           // { [itemKey]: boolean }
  starCounts: {},           // { [itemKey]: number }

  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// thunks

// Toggle bookmark for current user
export const toggleBookmark = createAsyncThunk(
  "engagement/toggleBookmark",
  async ({ itemType, itemId }, thunkAPI) => {
    try {
      return await engagementService.toggleBookmark({ itemType, itemId });
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Load current user's bookmarks
export const fetchUserBookmarks = createAsyncThunk(
  "engagement/fetchUserBookmarks",
  async (params = {}, thunkAPI) => {
    try {
      return await engagementService.getUserBookmarks(params);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Get bookmark status for one item
export const fetchBookmarkStatus = createAsyncThunk(
  "engagement/fetchBookmarkStatus",
  async ({ itemType, itemId }, thunkAPI) => {
    try {
      const res = await engagementService.getBookmarkStatus({
        itemType,
        itemId,
      });
      return { itemType, itemId, bookmarked: res.bookmarked };
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Toggle star
export const toggleStar = createAsyncThunk(
  "engagement/toggleStar",
  async ({ itemType, itemId }, thunkAPI) => {
    try {
      return await engagementService.toggleStar({ itemType, itemId });
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Get star status
export const fetchStarStatus = createAsyncThunk(
  "engagement/fetchStarStatus",
  async ({ itemType, itemId }, thunkAPI) => {
    try {
      const res = await engagementService.getStarStatus({ itemType, itemId });
      return { itemType, itemId, starred: res.starred };
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Get star count (public)
export const fetchStarCount = createAsyncThunk(
  "engagement/fetchStarCount",
  async ({ itemType, itemId }, thunkAPI) => {
    try {
      const res = await engagementService.getStarCount({ itemType, itemId });
      return { itemType: res.itemType, itemId: res.itemId, count: res.count };
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// slices

export const engagementSlice = createSlice({
  name: "engagement",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    clearEngagementState: (state) => {
      state.bookmarks = [];
      state.bookmarksPage = null;
      state.bookmarkStatus = {};
      state.starStatus = {};
      state.starCounts = {};
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Toggle bookmark
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const { bookmarked, bookmark } = action.payload;
        const itemKey = makeItemKey(bookmark.itemType, bookmark.itemId);

        state.bookmarkStatus[itemKey] = bookmarked;

        // update bookmarks list if currently loaded
        if (bookmarked) {
          // add if not present
          const exists = state.bookmarks.some(
            (b) => b.id === bookmark.id || b._id === bookmark._id
          );
          if (!exists) {
            state.bookmarks.unshift(bookmark);
          } else {
            state.bookmarks = state.bookmarks.map((b) =>
              b.id === bookmark.id || b._id === bookmark._id ? bookmark : b
            );
          }
        } else {
          // remove from list
          state.bookmarks = state.bookmarks.filter(
            (b) => b.id !== bookmark.id && b._id !== bookmark._id
          );
        }
      })

      // Fetch user bookmarks
      .addCase(fetchUserBookmarks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        state.bookmarks = action.payload.bookmarks || [];
        state.bookmarksPage = {
          page: action.payload.page,
          limit: action.payload.limit,
          count: action.payload.count,
        };

        // Sync bookmarkStatus map for those items
        state.bookmarks.forEach((bm) => {
          const itemKey = makeItemKey(bm.itemType, bm.itemId);
          state.bookmarkStatus[itemKey] = !bm.deleted;
        });
      })

      // Bookmark status for single item
      .addCase(fetchBookmarkStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const { itemType, itemId, bookmarked } = action.payload;
        const itemKey = makeItemKey(itemType, itemId);
        state.bookmarkStatus[itemKey] = bookmarked;
      })

      // Toggle star
      .addCase(toggleStar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const { starred, star } = action.payload;
        const itemKey = makeItemKey(star.itemType, star.itemId);

        state.starStatus[itemKey] = starred;

        // if we already know count, adjust optimistically
        if (typeof state.starCounts[itemKey] === "number") {
          state.starCounts[itemKey] += starred ? 1 : -1;
          if (state.starCounts[itemKey] < 0) state.starCounts[itemKey] = 0;
        }
      })

      // Star status
      .addCase(fetchStarStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const { itemType, itemId, starred } = action.payload;
        const itemKey = makeItemKey(itemType, itemId);
        state.starStatus[itemKey] = starred;
      })

      // Star count
      .addCase(fetchStarCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const { itemType, itemId, count } = action.payload;
        const itemKey = makeItemKey(itemType, itemId);
        state.starCounts[itemKey] = count;
      })

      // PENDING (all engagement thunks)
      .addMatcher(
        isPending(
          toggleBookmark,
          fetchUserBookmarks,
          fetchBookmarkStatus,
          toggleStar,
          fetchStarStatus,
          fetchStarCount
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
          toggleBookmark,
          fetchUserBookmarks,
          fetchBookmarkStatus,
          toggleStar,
          fetchStarStatus,
          fetchStarCount
        ),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const { reset, clearEngagementState } = engagementSlice.actions;
export default engagementSlice.reducer;
