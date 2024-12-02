import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RootState } from '../index';

interface Project {
  id: 0;
  name: 'string';
  description: 'string';
  createdAt: '2024-09-28T11:39:06.653Z';
}
interface UserState {
  token: string;
  projects: Project[];
}

const initialState: UserState = {
  token: '',
  projects: []
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    addProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    logout: () => initialState
  }
});

export const { setUser, logout } = userSlice.actions;
export const selectUser = (state: RootState) => state.user;
export default userSlice.reducer;
