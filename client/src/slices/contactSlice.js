import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';
import contactService from '../services/contactService';

const initialState = {
  contacts: [],        // list (from getContacts / getUnhandledContacts)
  pagination: null,    // { page, limit, total, totalPages }
  currentContact: null,// single contact view
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// thunks

// User-side: create contact
export const createContact = createAsyncThunk(
  'contacts/create',
  async (contactData, thunkAPI) => {
    try {
      return await contactService.createContact(contactData);
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

// Admin: get contacts (optionally with filters/pagination)
export const fetchContacts = createAsyncThunk(
  'contacts/fetchAll',
  async (params = {}, thunkAPI) => {
    try {
      return await contactService.getContacts(params);
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

// Admin: get unhandled contacts
export const fetchUnhandledContacts = createAsyncThunk(
  'contacts/fetchUnhandled',
  async (params = {}, thunkAPI) => {
    try {
      return await contactService.getUnhandledContacts(params);
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

// Admin: get contact by id
export const fetchContactById = createAsyncThunk(
  'contacts/fetchById',
  async (id, thunkAPI) => {
    try {
      return await contactService.getContactById(id);
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

// Admin: mark handled
export const markContactHandled = createAsyncThunk(
  'contacts/markHandled',
  async (id, thunkAPI) => {
    try {
      return await contactService.markContactHandled(id);
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

// Admin: delete contact
export const deleteContact = createAsyncThunk(
  'contacts/delete',
  async (id, thunkAPI) => {
    try {
      return await contactService.deleteContact(id);
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

export const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
    clearCurrentContact: (state) => {
      state.currentContact = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // create contact (user)
      .addCase(createContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // action.payload: { contact, metadata }
        const contact = action.payload.contact;
        if (contact) {
          state.contacts.push(contact);
        }
      })

      // admin: fetch all contacts
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contacts = action.payload.items || [];
        state.pagination = action.payload.pagination || null;
      })

      // admin: fetch unhandled contacts
      .addCase(fetchUnhandledContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contacts = action.payload.items || [];
        state.pagination = action.payload.pagination || null;
      })

      // admin: fetch contact by id
      .addCase(fetchContactById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentContact = action.payload.contact || null;
      })

      // admin: mark handled
      .addCase(markContactHandled.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const updated = action.payload.contact;
        if (!updated) return;

        // update in list
        state.contacts = state.contacts.map((c) => {
          if (c.id && c.id === updated.id) return updated;
          if (c._id && c._id === updated._id) return updated;
          return c;
        });

        // update current contact if same
        if (
          state.currentContact &&
          ((state.currentContact.id && state.currentContact.id === updated.id) ||
            (state.currentContact._id &&
              state.currentContact._id === updated._id))
        ) {
          state.currentContact = updated;
        }
      })

      // admin: delete contact
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const deletedId = action.payload.id;

        state.contacts = state.contacts.filter(
          (c) => c.id !== deletedId && c._id !== deletedId
        );

        if (
          state.currentContact &&
          (state.currentContact.id === deletedId ||
            state.currentContact._id === deletedId)
        ) {
          state.currentContact = null;
        }
      })

      // common pending
      .addMatcher(
        isPending(
          createContact,
          fetchContacts,
          fetchUnhandledContacts,
          fetchContactById,
          markContactHandled,
          deleteContact
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
          createContact,
          fetchContacts,
          fetchUnhandledContacts,
          fetchContactById,
          markContactHandled,
          deleteContact
        ),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const { reset, clearCurrentContact } = contactSlice.actions;
export default contactSlice.reducer;
