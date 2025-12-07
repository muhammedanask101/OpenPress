import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";

import answerService from "../services/answerService";

const initialState = {
  answersByQuestion: [],
  topAnswers: [],
  myAnswers: [],
  currentAnswer: null,
  pagination: null,

  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// thunks

// Fetch newest answers for a question
export const fetchAnswersByQuestion = createAsyncThunk(
  "answers/fetchByQuestion",
  async ({ questionId, params }, thunkAPI) => {
    try {
      return await answerService.getAnswersByQuestion(questionId, params);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Fetch top answers for a question
export const fetchTopAnswersByQuestion = createAsyncThunk(
  "answers/fetchTopByQuestion",
  async ({ questionId, params }, thunkAPI) => {
    try {
      return await answerService.getTopAnswersByQuestion(questionId, params);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Fetch single answer by ID
export const fetchAnswerById = createAsyncThunk(
  "answers/fetchById",
  async (id, thunkAPI) => {
    try {
      return await answerService.getAnswerById(id);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Create answer
export const createAnswer = createAsyncThunk(
  "answers/create",
  async (answerData, thunkAPI) => {
    try {
      return await answerService.postAnswer(answerData);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Update answer
export const updateAnswer = createAsyncThunk(
  "answers/update",
  async ({ id, body }, thunkAPI) => {
    try {
      return await answerService.updateAnswer(id, body);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Delete answer
export const deleteAnswer = createAsyncThunk(
  "answers/delete",
  async (id, thunkAPI) => {
    try {
      return await answerService.deleteAnswer(id);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Fetch current user's answers
export const fetchMyAnswers = createAsyncThunk(
  "answers/fetchMine",
  async (params, thunkAPI) => {
    try {
      return await answerService.getMyAnswers(params);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// slice
export const answerSlice = createSlice({
  name: "answers",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    clearCurrentAnswer: (state) => {
      state.currentAnswer = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch newest answers
      .addCase(fetchAnswersByQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.answersByQuestion = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })

      // Fetch top answers
      .addCase(fetchTopAnswersByQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.topAnswers = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })

      // Fetch single answer
      .addCase(fetchAnswerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentAnswer = action.payload;
      })

      // Create answer
      .addCase(createAnswer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myAnswers.unshift(action.payload);
      })

      // Update answer
      .addCase(updateAnswer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const updated = action.payload;

        // Update lists
        state.answersByQuestion = state.answersByQuestion.map((a) =>
          a.id === updated.id || a._id === updated._id ? updated : a
        );
        state.topAnswers = state.topAnswers.map((a) =>
          a.id === updated.id || a._id === updated._id ? updated : a
        );
        state.myAnswers = state.myAnswers.map((a) =>
          a.id === updated.id || a._id === updated._id ? updated : a
        );

        if (
          state.currentAnswer &&
          (state.currentAnswer.id === updated.id ||
            state.currentAnswer._id === updated._id)
        ) {
          state.currentAnswer = updated;
        }
      })

      // Delete answer
      .addCase(deleteAnswer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const id = action.payload.id;
        state.answersByQuestion = state.answersByQuestion.filter(
          (a) => a.id !== id && a._id !== id
        );
        state.topAnswers = state.topAnswers.filter(
          (a) => a.id !== id && a._id !== id
        );
        state.myAnswers = state.myAnswers.filter(
          (a) => a.id !== id && a._id !== id
        );

        if (
          state.currentAnswer &&
          (state.currentAnswer.id === id || state.currentAnswer._id === id)
        ) {
          state.currentAnswer = null;
        }
      })

      // Get user's answers
      .addCase(fetchMyAnswers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myAnswers = action.payload.data || [];
      })

      // PENDING (matches all async thunks)
      .addMatcher(
        isPending(
          fetchAnswersByQuestion,
          fetchTopAnswersByQuestion,
          fetchAnswerById,
          createAnswer,
          updateAnswer,
          deleteAnswer,
          fetchMyAnswers
        ),
        (state) => {
          state.isLoading = true;
          state.isError = false;
        }
      )

      // REJECTED common handler
      .addMatcher(
        isRejected(
          fetchAnswersByQuestion,
          fetchTopAnswersByQuestion,
          fetchAnswerById,
          createAnswer,
          updateAnswer,
          deleteAnswer,
          fetchMyAnswers
        ),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const { reset, clearCurrentAnswer } = answerSlice.actions;
export default answerSlice.reducer;
