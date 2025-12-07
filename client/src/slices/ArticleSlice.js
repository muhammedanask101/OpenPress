import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';
import articleService from '../services/articleService';

const initialState = {
  articles: [],        // public / admin list
  myArticles: [],      // list authored by current user
  currentArticle: null,// for detail page
  pagination: null,    // { page, limit, total, totalPages }
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// thunks

// Public/Shared: list articles with filters/search/pagination
// params = { page, limit, q, tag, author }
export const fetchArticles = createAsyncThunk(
  'articles/fetchAll',
  async (params = {}, thunkAPI) => {
    try {
      return await articleService.getArticles(params);
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

// Public: get article by id (controller enforces visibility)
export const fetchArticleById = createAsyncThunk(
  'articles/fetchById',
  async (id, thunkAPI) => {
    try {
      return await articleService.getArticleById(id);
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

// Public: get article by slug (increments views)
export const fetchArticleBySlug = createAsyncThunk(
  'articles/fetchBySlug',
  async (slug, thunkAPI) => {
    try {
      return await articleService.getArticleBySlug(slug);
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

// User: create article
export const createArticle = createAsyncThunk(
  'articles/create',
  async (articleData, thunkAPI) => {
    try {
      return await articleService.createArticle(articleData);
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

// User/Admin: update article
export const updateArticle = createAsyncThunk(
  'articles/update',
  async ({ id, articleData }, thunkAPI) => {
    try {
      return await articleService.updateArticle(id, articleData);
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

// User/Admin: delete (soft)
export const deleteArticle = createAsyncThunk(
  'articles/delete',
  async (id, thunkAPI) => {
    try {
      return await articleService.deleteArticle(id);
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

// User: get own authored articles
export const fetchMyArticles = createAsyncThunk(
  'articles/fetchMine',
  async (params = {}, thunkAPI) => {
    try {
      return await articleService.getMyArticles(params);
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

// slice

export const articleSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list (public/admin)
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.articles = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })

      // get by id
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentArticle = action.payload;
      })

      // get by slug
      .addCase(fetchArticleBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentArticle = action.payload;
      })

      // create
      .addCase(createArticle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const created = action.payload;
        // newly created article (likely pending) – push into myArticles
        state.myArticles.unshift(created);
      })

      // update
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updated = action.payload;

        state.articles = state.articles.map((a) =>
          (a.id && a.id === updated.id) || (a._id && a._id === updated._id)
            ? updated
            : a
        );

        state.myArticles = state.myArticles.map((a) =>
          (a.id && a.id === updated.id) || (a._id && a._id === updated._id)
            ? updated
            : a
        );

        if (
          state.currentArticle &&
          ((state.currentArticle.id &&
            state.currentArticle.id === updated.id) ||
            (state.currentArticle._id &&
              state.currentArticle._id === updated._id))
        ) {
          state.currentArticle = updated;
        }
      })

      // delete
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const deletedId = action.payload.id;

        state.articles = state.articles.filter(
          (a) => a.id !== deletedId && a._id !== deletedId
        );
        state.myArticles = state.myArticles.filter(
          (a) => a.id !== deletedId && a._id !== deletedId
        );

        if (
          state.currentArticle &&
          (state.currentArticle.id === deletedId ||
            state.currentArticle._id === deletedId)
        ) {
          state.currentArticle = null;
        }
      })

      // my articles
      .addCase(fetchMyArticles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myArticles = action.payload.data || [];
        // you can optionally store pagination here too
      })

      // common pending
      .addMatcher(
        isPending(
          fetchArticles,
          fetchArticleById,
          fetchArticleBySlug,
          createArticle,
          updateArticle,
          deleteArticle,
          fetchMyArticles
        ),
        (state) => {
          state.isLoading = true;
          state.isError = false;
          state.message = '';
        }
      )

      // common rejected
      .addMatcher(
        isRejected(
          fetchArticles,
          fetchArticleById,
          fetchArticleBySlug,
          createArticle,
          updateArticle,
          deleteArticle,
          fetchMyArticles
        ),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const { reset, clearCurrentArticle } = articleSlice.actions;
export default articleSlice.reducer;
