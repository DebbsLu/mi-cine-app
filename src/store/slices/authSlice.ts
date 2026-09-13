import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  userRole: 'user' | 'staff' | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userRole: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStaff: (state) => {
      state.isAuthenticated = true;
      state.userRole = 'staff';
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userRole = null;
    },
  },
});

export const { loginStaff, logout } = authSlice.actions;
export default authSlice.reducer;