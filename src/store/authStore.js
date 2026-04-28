import { create } from 'zustand';
import { authService } from '../services/auth.service';

export const useAuthStore = create((set) => ({
  user: null, 
  // SỬA Ở ĐÂY: Đọc từ access_token
  token: localStorage.getItem('access_token') || null, 
  isAuthLoading: false,

  setToken: (token) => {
    // SỬA Ở ĐÂY: Lưu vào access_token
    localStorage.setItem('access_token', token);
    set({ token });
  },

  logout: () => {
    // SỬA Ở ĐÂY: Xóa access_token
    localStorage.removeItem('access_token');
    set({ user: null, token: null });
  },

  fetchProfile: async () => {
    set({ isAuthLoading: true });
    try {
      const userData = await authService.getMe();
      set({ user: userData });
    } catch (error) {
      console.error("Lỗi lấy thông tin User:", error);
      // SỬA Ở ĐÂY: Xóa access_token
      localStorage.removeItem('access_token');
      set({ user: null, token: null });
    } finally {
      set({ isAuthLoading: false });
    }
  }
}));