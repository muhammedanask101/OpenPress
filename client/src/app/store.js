import { configureStore } from '@reduxjs/toolkit';
import projectReducer from '../slices/ProjectSlice';
import authReducer from '../slices/authSlice';
import contactReducer from '../slices/contactSlice';
import userReducer from '../slices/userSlice';

const store = configureStore({
  reducer: {
      projects: projectReducer,
      auth: authReducer,
      contacts: contactReducer,
      users:userReducer,
  }
});

export default store;
