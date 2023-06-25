import { configureStore, combineReducers } from '@reduxjs/toolkit';
import blogReducer from './redux/blogSlice';
import authReducer from './redux/authSlice';
import createBlogReducer from './redux/createBlogSlice';

const rootReducer = combineReducers({
    blog: blogReducer,
    auth: authReducer,
    createBlog: createBlogReducer,
});

const store = configureStore({
    reducer: rootReducer,
});

export default store;