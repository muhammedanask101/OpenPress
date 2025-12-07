import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";
import reportService from "../services/reportService";

const initialState = {
  reports: [],          // admin list
  pagination: null,     // { page, limit, total }
  reportsForItem: [],   // list for a specific item (admin)
  currentReport: null,  // single report
  lastCreatedReport: null, // user-created report

  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// thunks

// USER: create report
export const createReport = createAsyncThunk(
  "reports/create",
  async (reportData, thunkAPI) => {
    try {
      return await reportService.createReport(reportData);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ADMIN: list reports (with filters)
export const fetchReports = createAsyncThunk(
  "reports/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      return await reportService.getReports(params);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ADMIN: get reports for specific item
export const fetchReportsForItem = createAsyncThunk(
  "reports/fetchForItem",
  async (params = {}, thunkAPI) => {
    try {
      return await reportService.getReportsForItem(params);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ADMIN: get single report by id
export const fetchReportById = createAsyncThunk(
  "reports/fetchById",
  async (id, thunkAPI) => {
    try {
      return await reportService.getReportById(id);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ADMIN: update intermediate status / notes
export const updateReport = createAsyncThunk(
  "reports/update",
  async ({ id, data }, thunkAPI) => {
    try {
      return await reportService.updateReport(id, data);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ADMIN: resolve report
export const resolveReport = createAsyncThunk(
  "reports/resolve",
  async ({ id, data }, thunkAPI) => {
    try {
      return await reportService.resolveReport(id, data);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ADMIN: reject report
export const rejectReport = createAsyncThunk(
  "reports/reject",
  async ({ id, data }, thunkAPI) => {
    try {
      return await reportService.rejectReport(id, data);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ADMIN: delete (soft) report
export const deleteReport = createAsyncThunk(
  "reports/delete",
  async (id, thunkAPI) => {
    try {
      return await reportService.deleteReport(id);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || err.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// slice

export const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    clearCurrentReport: (state) => {
      state.currentReport = null;
    },
    clearReportsForItem: (state) => {
      state.reportsForItem = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // USER: created report
      .addCase(createReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.lastCreatedReport = action.payload;
      })

      // ADMIN: list reports
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.reports = action.payload.reports || [];
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })

      // ADMIN: reports for specific item
      .addCase(fetchReportsForItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.reportsForItem = action.payload || [];
      })

      // ADMIN: single report
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentReport = action.payload;
      })

      // ADMIN: update / resolve / reject all return updated report
      .addCase(updateReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updated = action.payload;

        state.reports = state.reports.map((r) =>
          r.id === updated.id || r._id === updated._id ? updated : r
        );
        state.reportsForItem = state.reportsForItem.map((r) =>
          r.id === updated.id || r._id === updated._id ? updated : r
        );
        if (
          state.currentReport &&
          (state.currentReport.id === updated.id ||
            state.currentReport._id === updated._id)
        ) {
          state.currentReport = updated;
        }
      })
      .addCase(resolveReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updated = action.payload;

        state.reports = state.reports.map((r) =>
          r.id === updated.id || r._id === updated._id ? updated : r
        );
        state.reportsForItem = state.reportsForItem.map((r) =>
          r.id === updated.id || r._id === updated._id ? updated : r
        );
        if (
          state.currentReport &&
          (state.currentReport.id === updated.id ||
            state.currentReport._id === updated._id)
        ) {
          state.currentReport = updated;
        }
      })
      .addCase(rejectReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updated = action.payload;

        state.reports = state.reports.map((r) =>
          r.id === updated.id || r._id === updated._id ? updated : r
        );
        state.reportsForItem = state.reportsForItem.map((r) =>
          r.id === updated.id || r._id === updated._id ? updated : r
        );
        if (
          state.currentReport &&
          (state.currentReport.id === updated.id ||
            state.currentReport._id === updated._id)
        ) {
          state.currentReport = updated;
        }
      })

      // ADMIN: delete (soft)
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const deletedId = action.payload.id;

        state.reports = state.reports.filter(
          (r) => r.id !== deletedId && r._id !== deletedId
        );
        state.reportsForItem = state.reportsForItem.filter(
          (r) => r.id !== deletedId && r._id !== deletedId
        );
        if (
          state.currentReport &&
          (state.currentReport.id === deletedId ||
            state.currentReport._id === deletedId)
        ) {
          state.currentReport = null;
        }
      })

      // common pending
      .addMatcher(
        isPending(
          createReport,
          fetchReports,
          fetchReportsForItem,
          fetchReportById,
          updateReport,
          resolveReport,
          rejectReport,
          deleteReport
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
          createReport,
          fetchReports,
          fetchReportsForItem,
          fetchReportById,
          updateReport,
          resolveReport,
          rejectReport,
          deleteReport
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
  clearCurrentReport,
  clearReportsForItem,
} = reportSlice.actions;

export default reportSlice.reducer;
