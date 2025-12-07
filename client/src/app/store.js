import { configureStore } from '@reduxjs/toolkit';
import articleReducer from '../slices/ArticleSlice';
import adminReducer from '../slices/adminSlice';
import contactReducer from '../slices/contactSlice';
import userReducer from '../slices/userSlice';
import questionReducer from '../slices/questionSlice';
import answerReducer from "../slices/answerSlice";
import commentReducer from "../slices/commentSlice";
import badgeReducer from "../slices/badgeSlice";
import reportReducer from "../slices/reportSlice";
import moderationReducer from "../slices/moderationSlice";
import engagementReducer from "../slices/engagementSlice";
import mediaReducer from "../slices/mediaSlice";
import sitesettingsReducer from "../slices/sitesettingsSlice";
import uiReducer from "../slices/uiSlice";

const store = configureStore({
  reducer: {
    articles: articleReducer,
    admin: adminReducer,
    contacts: contactReducer,
    user: userReducer,
    questions: questionReducer,
    answers: answerReducer,
    comments: commentReducer,
    badges: badgeReducer,
    reports: reportReducer,
    moderation: moderationReducer,
    engagement: engagementReducer,
    media: mediaReducer,
    sitesettings: sitesettingsReducer,
    ui: uiReducer,
  },
});

export default store;
