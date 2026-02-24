import { createSlice } from "@reduxjs/toolkit";
import { decodeToken, isExpired } from "react-jwt";

interface AuthState {
  id: number | null;
  name: string | null;
  username: string | null;
  role: string | null;
  token: string | null;
}

const initialState: AuthState = {
  id: null,
  name: null,
  username: null,
  role: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  selectors: {
    isAuthenticated: (state) => !!state.token,
  },
  reducers: {
    setAuth: (state, action) => {
      const token = action.payload;
      const decoded: any = decodeToken(token);
      const expired = isExpired(token);
      if (!decoded || expired) {
        state.id = null;
        state.name = null;
        state.username = null;
        state.role = null;
        state.token = null;
        return;
      }

      // ✅ JWT simple y directo
      state.id = decoded.id ?? null;
      state.name = decoded.name ?? "Usuario";
      state.username = decoded.username ?? null;
      state.role = decoded.role ?? null;
      state.token = token;
    },

    logout: (state) => {
      state.id = null;
      state.name = null;
      state.username = null;
      state.role = null;
      state.token = null;
    },
  },
});

export default authSlice.reducer;

export const { setAuth, logout } = authSlice.actions;
export const { isAuthenticated } = authSlice.selectors;
