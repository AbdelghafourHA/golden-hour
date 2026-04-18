import { create } from "zustand";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const useAuth = create((set) => ({
  user: null,
  loading: false,
  isAuthenticated: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post("/admin/login", { email, password });

      set({
        user: response.data.user,
        isAuthenticated: true,
        loading: false,
      });
      toast.success("تم تسجيل الدخول بنجاح");
    } catch (error) {
      set({ loading: false, error: error.message });
      toast.error("خطاء في تسجيل الدخول");
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      await api.post("/admin/logout");
      set({ user: null, isAuthenticated: false, loading: false });
      toast.success("تم تسجيل الخروج بنجاح");
    } catch (error) {
      set({ loading: false, error: error.message });
      toast.error("خطاء في تسجيل الخروج");
    }
  },

  checkAuth: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get("/admin/check-auth");

      set({
        user: response.data.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: error.message,
      });
    }
  },
}));

export default useAuth;
