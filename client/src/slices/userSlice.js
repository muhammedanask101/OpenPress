import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import userService from '../services/userService'

const localuser = JSON.parse(localStorage.getItem('user'))

const initialState = {
    user: localuser ? localuser : null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
}

export const register = createAsyncThunk(
    'user/register',
    async (user, thunkAPI) => {
    try {
        return await userService.register(user)
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString()    
        return thunkAPI.rejectWithValue(message)
    }
    }
)

export const userLogin = createAsyncThunk('user/login', async (user, thunkAPI) => {
    try {
        return await userService.login(user)
    } catch (error) {
        const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

export const userLogout = createAsyncThunk('user/logout', async () => await userService.logout())

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        reset: state => {
            state.isLoading = false
            state.isSuccess = false
            state.isError = false
            state.message = ''
        },
    },
    extraReducers: builder => {
        builder
        .addCase(register.pending, (state) => {
            state.isLoading = true
        })
        .addCase(register.fulfilled, (state, action) => {
            state.isLoading = false
            state.isSuccess = true
            state.user = action.payload
        })
        .addCase(register.rejected, (state, action) => {
            state.isLoading = false
            state.isError = true
            state.message = action.payload
            state.user = null
        })
        .addCase(userLogin.pending, (state) => {
            state.isLoading = true
        })
        .addCase(userLogin.fulfilled, (state, action) => {
            state.isLoading = false
            state.isSuccess = true
            state.user = action.payload
        })
        .addCase(userLogin.rejected, (state, action) => {
            state.isLoading = false
            state.isError = true
            state.message = action.payload
            state.user = null
        })
        .addCase(userLogout.fulfilled, (state) => {
            state.user = null
        })
        }
})

export const { reset } = userSlice.actions
export default userSlice.reducer 