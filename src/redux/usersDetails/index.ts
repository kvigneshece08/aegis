import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

const initialState: any = {
  lists: [],
};

export const usersListSlice = createSlice({
  name: 'usersList',
  initialState,
  reducers: {
    setUsersList: (state, action: PayloadAction<any>) => ({
      ...state,
      ...action.payload,
    }),
  },
});

// this is for dispatch
export const {setUsersList} = usersListSlice.actions;

// this is for configureStore
export default usersListSlice.reducer;
