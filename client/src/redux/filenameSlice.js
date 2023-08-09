import { createSlice } from '@reduxjs/toolkit';

const initialState = ''


const filenameSlice = createSlice({
    name: 'workbook',
    initialState,
    reducers: {
        setFileName: (state, action) => {
            console.log(state, action);
            state = action.payload;
        }
    },
});

export const { setFileName } = filenameSlice.actions;
export default filenameSlice.reducer;