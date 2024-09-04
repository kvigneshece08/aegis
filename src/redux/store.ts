import {configureStore} from '@reduxjs/toolkit';
import {apiServices} from '../services/apiServices';
import {IS_DEV} from '../constants/enumValues';
import authDetailsReducer from './authDetails';
import assignedProjectsReducer from './assignedProjects';

const middlewareList = [apiServices.middleware];

if (IS_DEV) {
  const createDebugger = require('redux-flipper').default;
  middlewareList.push(createDebugger());
}

export const store = configureStore({
  reducer: {
    [apiServices.reducerPath]: apiServices.reducer,
    authDetails: authDetailsReducer,
    assignedProjects: assignedProjectsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(middlewareList),
  devTools: IS_DEV,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
