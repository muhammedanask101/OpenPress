// src/slices/ArticleSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import articleService from '../services/articleService';

// initial state with per-operation flags
const initialState = {
  articles: [],         // array of articles (list endpoints)
  myArticles: [],       // user's articles
  currentArticle: null, // single article for detail page
  pagination: null,

  // operation-specific flags
  isLoadingList: false,
  isLoadingItem: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  // generic error / success
  isError: false,
  isSuccess: false,
  message: '',

  // used by thunk 'condition' and to avoid duplicate fetches
  loadingSlug: null,
};

// -------------------- thunks (you already had these) --------------------
// getArticles(params) => expected { data: [...], pagination: {...} } or [...]
// getArticleById(id) => expected article object
// getArticleBySlug(slug) => expected article object (controller should return single object)
// createArticle(articleData) => created article object
// updateArticle({id, articleData}) => updated article object
// deleteArticle(id) => { id } or deleted article id
// getMyArticles(params) => expected { data: [...], pagination? }

export const getArticles = createAsyncThunk(
  'articles/getAll',
  async (params = {}, thunkAPI) => {
    try {
      return await articleService.getArticles(params);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getArticleById = createAsyncThunk(
  'articles/getById',
  async (id, thunkAPI) => {
    try {
      return await articleService.getArticleById(id);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getArticleBySlug = createAsyncThunk(
  'articles/getBySlug',
  async (slug, thunkAPI) => {
    try {
      const article = await articleService.getArticleBySlug(slug);
      return article;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
  {
    condition: (slug, { getState }) => {
      const { articles } = getState();
      // don't fetch if already loading the same slug
      if (articles.isLoadingItem && articles.loadingSlug === slug) return false;
      return true;
    },
  }
);

export const createArticle = createAsyncThunk(
  'articles/create',
  async (articleData, thunkAPI) => {
    try {
      return await articleService.createArticle(articleData);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateArticle = createAsyncThunk(
  'articles/update',
  async ({ id, articleData }, thunkAPI) => {
    try {
      return await articleService.updateArticle(id, articleData);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteArticle = createAsyncThunk(
  'articles/delete',
  async (id, thunkAPI) => {
    try {
      return await articleService.deleteArticle(id);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMyArticles = createAsyncThunk(
  'articles/getMine',
  async (params = {}, thunkAPI) => {
    try {
      return await articleService.getMyArticles(params);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// -------------------- slice --------------------
const articleSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    // clear only flags and message; keep lists/intact
    reset(state) {
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
      state.isLoadingList = false;
      state.isLoadingItem = false;
      state.isCreating = false;
      state.isUpdating = false;
      state.isDeleting = false;
      state.loadingSlug = null;
    },
    clearCurrentArticle(state) {
      state.currentArticle = null;
    },
  },
  extraReducers: (builder) => {
    // ----- getArticles (list) -----
    builder
      .addCase(getArticles.pending, (state) => {
        state.isLoadingList = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getArticles.fulfilled, (state, action) => {
        state.isLoadingList = false;
        state.isSuccess = true;
        // server likely returns { data: [...], pagination: {...} }
        if (action.payload && action.payload.data && Array.isArray(action.payload.data)) {
          state.articles = action.payload.data;
          state.pagination = action.payload.pagination || null;
        } else if (Array.isArray(action.payload)) {
          state.articles = action.payload;
          state.pagination = null;
        } else if (action.payload && action.payload.data && !Array.isArray(action.payload.data)) {
          // defensive: if server returned single object in data
          state.articles = [action.payload.data];
          state.pagination = null;
        } else {
          state.articles = action.payload || [];
          state.pagination = state.pagination || null;
        }
      })
      .addCase(getArticles.rejected, (state, action) => {
        state.isLoadingList = false;
        state.isError = true;
        state.message = action.payload || action.error?.message || 'Failed to load articles';
      });

    // ----- getArticleById (single by id) -----
    builder
      .addCase(getArticleById.pending, (state) => {
        state.isLoadingItem = true;
        state.isError = false;
        state.message = '';
        state.loadingSlug = null;
      })
      .addCase(getArticleById.fulfilled, (state, action) => {
        state.isLoadingItem = false;
        state.isSuccess = true;
        state.currentArticle = action.payload;
      })
      .addCase(getArticleById.rejected, (state, action) => {
        state.isLoadingItem = false;
        state.isError = true;
        state.message = action.payload || action.error?.message || 'Failed to load article';
      });

    // ----- getArticleBySlug (single by slug) -----
    builder
      .addCase(getArticleBySlug.pending, (state, action) => {
        state.isLoadingItem = true;
        state.isError = false;
        state.message = '';
        state.loadingSlug = action.meta.arg; // slug
      })
      .addCase(getArticleBySlug.fulfilled, (state, action) => {
        state.isLoadingItem = false;
        state.isSuccess = true;
        state.loadingSlug = null;

        // action.payload could be:
        // - article object
        // - { data: [ ... ] } (list wrapper)
        // - { data: article } (wrapper)
        if (!action.payload) {
          state.currentArticle = null;
          return;
        }

        if (action.payload.data && Array.isArray(action.payload.data)) {
          state.currentArticle = action.payload.data[0] || null;
        } else if (action.payload.data && typeof action.payload.data === 'object') {
          state.currentArticle = action.payload.data;
        } else {
          state.currentArticle = action.payload;
        }
      })
      .addCase(getArticleBySlug.rejected, (state, action) => {
        state.isLoadingItem = false;
        state.isError = true;
        state.message = action.payload || action.error?.message || 'Failed to load article';
        state.loadingSlug = null;
        state.currentArticle = null;
      });

    // ----- createArticle -----
    builder
      .addCase(createArticle.pending, (state) => {
        state.isCreating = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.isCreating = false;
        state.isSuccess = true;
        const created = action.payload;
        // add to myArticles (newest first)
        if (created) {
          state.myArticles = [created, ...state.myArticles];
          // optionally also add to public list if approved
          // if (created.isPublished) state.articles.unshift(created);
        }
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.isCreating = false;
        state.isError = true;
        state.message = action.payload || action.error?.message || 'Failed to create article';
      });

    // ----- updateArticle -----
    builder
      .addCase(updateArticle.pending, (state) => {
        state.isUpdating = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.isSuccess = true;
        const updated = action.payload;
        if (!updated) return;

        // helper to replace in an array by id/_id
        const replaceInArray = (arr) =>
          arr.map((a) =>
            (a.id && a.id === updated.id) || (a._id && a._id === updated._id) ? updated : a
          );

        state.articles = replaceInArray(state.articles);
        state.myArticles = replaceInArray(state.myArticles);

        if (state.currentArticle) {
          if (
            (state.currentArticle.id && state.currentArticle.id === updated.id) ||
            (state.currentArticle._id && state.currentArticle._id === updated._id)
          ) {
            state.currentArticle = updated;
          }
        }
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.isUpdating = false;
        state.isError = true;
        state.message = action.payload || action.error?.message || 'Failed to update article';
      });

    // ----- deleteArticle -----
    builder
      .addCase(deleteArticle.pending, (state) => {
        state.isDeleting = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.isSuccess = true;
        // payload might be { id } or { _id } or the deleted id directly
        const payload = action.payload;
        const deletedId =
          (payload && payload.id) || (payload && payload._id) || (typeof payload === 'string' ? payload : null);

        if (!deletedId) return;

        state.articles = state.articles.filter((a) => a.id !== deletedId && a._id !== deletedId);
        state.myArticles = state.myArticles.filter((a) => a.id !== deletedId && a._id !== deletedId);

        if (
          state.currentArticle &&
          (state.currentArticle.id === deletedId || state.currentArticle._id === deletedId)
        ) {
          state.currentArticle = null;
        }
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.isDeleting = false;
        state.isError = true;
        state.message = action.payload || action.error?.message || 'Failed to delete article';
      });

    // ----- getMyArticles -----
    builder
      .addCase(getMyArticles.pending, (state) => {
        state.isLoadingList = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getMyArticles.fulfilled, (state, action) => {
        state.isLoadingList = false;
        state.isSuccess = true;
        if (action.payload && action.payload.data && Array.isArray(action.payload.data)) {
          state.myArticles = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.myArticles = action.payload;
        } else {
          state.myArticles = action.payload?.data ?? action.payload ?? [];
        }
      })
      .addCase(getMyArticles.rejected, (state, action) => {
        state.isLoadingList = false;
        state.isError = true;
        state.message = action.payload || action.error?.message || 'Failed to load your articles';
      });
  },
});

export const { reset, clearCurrentArticle } = articleSlice.actions;
export default articleSlice.reducer;
