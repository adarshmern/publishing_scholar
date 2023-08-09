import {configureStore } from "@reduxjs/toolkit";
import apiReducer from './apiSlice'
import nameReducer from './filenameSlice'

const store = configureStore({
    reducer:{
        api:apiReducer,
        name:nameReducer
    }
});

export default store;