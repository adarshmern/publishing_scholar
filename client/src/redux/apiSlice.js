import { createSlice } from '@reduxjs/toolkit';

const initialState ={
  data:[]
}


const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setUserBasedData: (state, action) => {
        console.log(state,action);
      state.data= action.payload.data;
    }
  },
});

export const { setUserBasedData } = apiSlice.actions;
export default apiSlice.reducer;