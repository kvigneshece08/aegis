import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../store';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  username: string;
}
export interface AuthDetailsState {
  user: User | null;
  accessToken: string | null;
  resetFlag?: boolean;
  isAuthLoading?: boolean;
}

const initialState: AuthDetailsState = {
  user: null,
  accessToken: null,
  resetFlag: false,
  isAuthLoading: true,
};

export const authDetailsSlice = createSlice({
  name: 'authDetails',
  initialState,
  reducers: {
    setAuthDetails: (state, action: PayloadAction<AuthDetailsState>) => ({
      ...state,
      ...action.payload,
    }),
    removeAuthDetails: () => ({...initialState, isAuthLoading: false}),
  },
});

export const selectCurrentUser = (state: RootState) => state.authDetails.user;

// this is for dispatch
export const {setAuthDetails, removeAuthDetails} = authDetailsSlice.actions;

// this is for configureStore
export default authDetailsSlice.reducer;
