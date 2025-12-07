import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";

import commentService from "../services/commentService";

const initialState = {
  commentsByArticle: [],      // last loaded article comments
  repliesByComment: {},       // { [commentId]: [replies array] }
  myComments: [],             // comments by current user
  currentComment: null,       // for viewing a single comment
  pagination: null,           // for last list call (article or mycomments)

  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// thunks

// Get comments for an article
export const fetchCommentsForArticle = createAsyncThunk(
  "comments/fetchForArticle",
  async ({ articleId, params }, thunkAPI) => {
    try {
      return await commentService.getCommentsForArticle(articleId, params);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Get replies for a comment
export const fetchRepliesForComment = createAsyncThunk(
  "comments/fetchReplies",
  async ({ commentId, params }, thunkAPI) => {
    try {
      return await commentService.getRepliesForComment(commentId, params);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Get single comment by id
export const fetchCommentById = createAsyncThunk(
  "comments/fetchById",
  async (id, thunkAPI) => {
    try {
      return await commentService.getCommentById(id);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Create comment
export const createComment = createAsyncThunk(
  "comments/create",
  async (commentData, thunkAPI) => {
    try {
      return await commentService.createComment(commentData);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Update comment
export const updateComment = createAsyncThunk(
  "comments/update",
  async ({ id, body }, thunkAPI) => {
    try {
      return await commentService.updateComment(id, body);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Delete comment
export const deleteComment = createAsyncThunk(
  "comments/delete",
  async (id, thunkAPI) => {
    try {
      return await commentService.deleteComment(id);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Get current user's comments
export const fetchMyComments = createAsyncThunk(
  "comments/fetchMine",
  async (params, thunkAPI) => {
    try {
      return await commentService.getMyComments(params);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// slices

export const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    clearCurrentComment: (state) => {
      state.currentComment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // comments for article
      .addCase(fetchCommentsForArticle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.commentsByArticle = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })

      // replies for comment
      .addCase(fetchRepliesForComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const commentId = action.meta.arg.commentId;
        state.repliesByComment[commentId] = action.payload.data || [];
        // (You can also store a separate pagination map if needed)
      })

      // single comment
      .addCase(fetchCommentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentComment = action.payload;
      })

      // create comment
      .addCase(createComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const created = action.payload;

        // If it has parent, push into that parent replies cache
        if (created.parent) {
          const parentId = created.parent.toString();
          const existing = state.repliesByComment[parentId] || [];
          state.repliesByComment[parentId] = [...existing, created];
        } else {
          // top-level comment for an article
          state.commentsByArticle = [...state.commentsByArticle, created];
        }

        state.myComments.unshift(created);
      })

      // update comment
      .addCase(updateComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updated = action.payload;

        // update in commentsByArticle
        state.commentsByArticle = state.commentsByArticle.map((c) =>
          c.id === updated.id || c._id === updated._id ? updated : c
        );

        // update in each replies list
        Object.keys(state.repliesByComment).forEach((parentId) => {
          state.repliesByComment[parentId] = state.repliesByComment[parentId].map(
            (c) =>
              c.id === updated.id || c._id === updated._id ? updated : c
          );
        });

        // update in myComments
        state.myComments = state.myComments.map((c) =>
          c.id === updated.id || c._id === updated._id ? updated : c
        );

        // update currentComment
        if (
          state.currentComment &&
          (state.currentComment.id === updated.id ||
            state.currentComment._id === updated._id)
        ) {
          state.currentComment = updated;
        }
      })

      // delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const deletedId = action.payload.id;

        // remove from top-level comments
        state.commentsByArticle = state.commentsByArticle.filter(
          (c) => c.id !== deletedId && c._id !== deletedId
        );

        // remove from replies
        Object.keys(state.repliesByComment).forEach((parentId) => {
          state.repliesByComment[parentId] = state.repliesByComment[parentId].filter(
            (c) => c.id !== deletedId && c._id !== deletedId
          );
        });

        // remove from myComments
        state.myComments = state.myComments.filter(
          (c) => c.id !== deletedId && c._id !== deletedId
        );

        // clear currentComment if it was that one
        if (
          state.currentComment &&
          (state.currentComment.id === deletedId ||
            state.currentComment._id === deletedId)
        ) {
          state.currentComment = null;
        }
      })

      // my comments
      .addCase(fetchMyComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myComments = action.payload.data || [];
        // can also store pagination for myComments if needed
      })

      // pending
      .addMatcher(
        isPending(
          fetchCommentsForArticle,
          fetchRepliesForComment,
          fetchCommentById,
          createComment,
          updateComment,
          deleteComment,
          fetchMyComments
        ),
        (state) => {
          state.isLoading = true;
          state.isError = false;
          state.message = "";
        }
      )

      // rejected
      .addMatcher(
        isRejected(
          fetchCommentsForArticle,
          fetchRepliesForComment,
          fetchCommentById,
          createComment,
          updateComment,
          deleteComment,
          fetchMyComments
        ),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const { reset, clearCurrentComment } = commentSlice.actions;
export default commentSlice.reducer;
