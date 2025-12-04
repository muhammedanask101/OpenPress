import { createSlice, createAsyncThunk, isPending, isRejected } from "@reduxjs/toolkit";
import articleService from "../services/ArticleService";

const initialState = {
    articles: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
}

export const createArticle = createAsyncThunk('articles/create', async (articleData, thunkAPI) => {
    try{
        const token = thunkAPI.getState().auth.user.token;
        return await articleService.createArticle(articleData, token);
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message)
        || error.message
        || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
})

export const getArticles = createAsyncThunk('articles/getarticles', async (_, thunkAPI) => {
    try{
        return await articleService.getArticle();
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message)
        || error.message
        || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
})

export const deleteArticle = createAsyncThunk('articles/delete', async (id, thunkAPI) => {
    try{
        const token = thunkAPI.getState().auth.user.token;
        return await articleService.deleteArticle(id, token);
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message)
        || error.message
        || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
})

export const updateArticle = createAsyncThunk('articles/update', async ({ id, articleData }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            return await articleService.updateArticle(id, articleData, token);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message)
            || error.message
            || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const articleSlice = createSlice({
    name: 'article',
    initialState,
    reducers: {
        reset: state => { 
            state.isError = false,
            state.isSuccess = false,
            state.isLoading = false,
            state.message = ''
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(createArticle.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.articles.push(action.payload);
        })
        .addCase(getArticles.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.articles = action.payload;
        })
        .addCase(deleteArticle.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.articles = state.articles.filter(article => article._id !== action.payload.id);
        })
        .addCase(updateArticle.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.articles = state.articles.map(article => article._id === action.payload._id ? action.payload : article);
        })
        .addMatcher(isPending(createArticle, getArticles, deleteArticle, updateArticle), (state) => {
            state.isLoading = true;
        })
        .addMatcher(isRejected(createArticle, getArticles, deleteArticle, updateArticle), (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })

    }
})

export const { reset } = articleSlice.actions;
export default articleSlice.reducer;