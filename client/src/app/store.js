import { configureStore } from '@reduxjs/toolkit';
import articleReducer from '../slices/ArticleSlice';
import adminReducer from '../slices/adminSlice';
import contactReducer from '../slices/contactSlice';
import userReducer from '../slices/userSlice';

const store = configureStore({
  reducer: {
      articles: articleReducer,
      admin: adminReducer,
      contacts: contactReducer,
      users: userReducer,
  }
});

export default store;
