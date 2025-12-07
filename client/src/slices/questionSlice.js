import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';
import questionService from '../services/questionService';

const initialState = {
  questions: [],        // public/admin list
  myQuestions: [],      // authored by current user
  currentQuestion: null,
  pagination: null,     // { page, limit, total, totalPages }
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// thunks

// list questions (public, q/tag/author/page/limit)
export const fetchQuestions = createAsyncThunk(
  'questions/fetchAll',
  async (params = {}, thunkAPI) => {
    try {
      return await questionService.getQuestions(params);
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

// get one question by id (public)
export const fetchQuestionById = createAsyncThunk(
  'questions/fetchById',
  async (id, thunkAPI) => {
    try {
      return await questionService.getQuestionById(id);
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

// create question (user)
export const createQuestion = createAsyncThunk(
  'questions/create',
  async (questionData, thunkAPI) => {
    try {
      return await questionService.createQuestion(questionData);
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

// update question (owner or admin)
export const updateQuestion = createAsyncThunk(
  'questions/update',
  async ({ id, questionData }, thunkAPI) => {
    try {
      return await questionService.updateQuestion(id, questionData);
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

// delete (soft) question (owner or admin)
export const deleteQuestion = createAsyncThunk(
  'questions/delete',
  async (id, thunkAPI) => {
    try {
      return await questionService.deleteQuestion(id);
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

// get questions authored by current user
export const fetchMyQuestions = createAsyncThunk(
  'questions/fetchMine',
  async (params = {}, thunkAPI) => {
    try {
      return await questionService.getMyQuestions(params);
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

export const questionSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.questions = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })

      // detail
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentQuestion = action.payload;
      })

      // create
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const created = action.payload;
        state.myQuestions.unshift(created);
      })

      // update
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updated = action.payload;

        state.questions = state.questions.map((q) =>
          (q.id && q.id === updated.id) || (q._id && q._id === updated._id)
            ? updated
            : q
        );

        state.myQuestions = state.myQuestions.map((q) =>
          (q.id && q.id === updated.id) || (q._id && q._id === updated._id)
            ? updated
            : q
        );

        if (
          state.currentQuestion &&
          ((state.currentQuestion.id &&
            state.currentQuestion.id === updated.id) ||
            (state.currentQuestion._id &&
              state.currentQuestion._id === updated._id))
        ) {
          state.currentQuestion = updated;
        }
      })

      // delete
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const deletedId = action.payload.id;

        state.questions = state.questions.filter(
          (q) => q.id !== deletedId && q._id !== deletedId
        );
        state.myQuestions = state.myQuestions.filter(
          (q) => q.id !== deletedId && q._id !== deletedId
        );

        if (
          state.currentQuestion &&
          (state.currentQuestion.id === deletedId ||
            state.currentQuestion._id === deletedId)
        ) {
          state.currentQuestion = null;
        }
      })

      // my questions
      .addCase(fetchMyQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myQuestions = action.payload.data || [];
        // you can also keep pagination for "my" list if needed
      })

      // pending
      .addMatcher(
        isPending(
          fetchQuestions,
          fetchQuestionById,
          createQuestion,
          updateQuestion,
          deleteQuestion,
          fetchMyQuestions
        ),
        (state) => {
          state.isLoading = true;
          state.isError = false;
          state.message = '';
        }
      )

      // rejected
      .addMatcher(
        isRejected(
          fetchQuestions,
          fetchQuestionById,
          createQuestion,
          updateQuestion,
          deleteQuestion,
          fetchMyQuestions
        ),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const { reset, clearCurrentQuestion } = questionSlice.actions;
export default questionSlice.reducer;
