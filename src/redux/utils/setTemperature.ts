import {createSlice} from '@reduxjs/toolkit';

const temperatureSlice = createSlice({
  name: 'temperature',
  initialState: {
    data: null,
    expiryDate: null,
  },
  reducers: {
    setTemperature: (state, action) => {
      state.data = action.payload.data;
      state.expiryDate = action.payload.expiryDate;
    },
  },
});

export const {setTemperature} = temperatureSlice.actions;

export default temperatureSlice.reducer;
