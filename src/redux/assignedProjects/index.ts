import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

const initialState: any = {
  availableProject: [],
  currentProject: {
    builderDetails: {},
    projectDetails: {},
    taskDetails: {},
    baselineDetails: {},
  },
};

export const assignedProjectsSlice = createSlice({
  name: 'assignedProjects',
  initialState,
  reducers: {
    setAssignedProjects: (state, action: PayloadAction<any>) => ({
      ...state,
      ...action.payload,
    }),
  },
});

// this is for dispatch
export const {setAssignedProjects} = assignedProjectsSlice.actions;

// this is for configureStore
export default assignedProjectsSlice.reducer;
