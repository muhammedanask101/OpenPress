import { configureStore } from '@reduxjs/toolkit';
import articleReducer from '../slices/ArticleSlice';
import authReducer from '../slices/authSlice';
import contactReducer from '../slices/contactSlice';
import userReducer from '../slices/userSlice';

const store = configureStore({
  reducer: {
      articles: articleReducer,
      auth: authReducer,
      contacts: contactReducer,
      users: userReducer,
  }
});

export default store;
