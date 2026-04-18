import { create } from "zustand";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const useBoatsStore = create((set, get) => ({
  boats: [],
  loading: false,
  error: null,

  fetchBoats: async () => {
    set({ loading: true, error: null });

    try {
      const response = await api.get("/boats");
      set({ boats: response.data, loading: false });
    } catch (error) {
      console.error("Fetch boats error:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch boats",
      });
      toast.error("فشل في جلب القوارب");
    }
  },

  addBoat: async (boatData) => {
    set({ loading: true, error: null });

    try {
      const formData = new FormData();
      formData.append("title", boatData.title);
      formData.append("place", boatData.place); // FIX: Added
      formData.append("description", boatData.description);
      formData.append("price1h", boatData.price1h);
      formData.append("price2h", boatData.price2h);
      formData.append("price3h", boatData.price3h); // FIX: Added
      formData.append("price4h", boatData.price4h); // FIX: Added
      formData.append("capacity", boatData.capacity);

      if (boatData.image) {
        formData.append("image", boatData.image);
      }

      const response = await api.post("/boats", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set((state) => ({
        boats: [response.data, ...state.boats],
        loading: false,
      }));

      toast.success("تم إضافة القارب بنجاح");
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "فشل في إضافة القارب";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  updateBoat: async (id, boatData) => {
    set({ loading: true, error: null });

    try {
      const formData = new FormData();

      if (boatData.title) formData.append("title", boatData.title);
      if (boatData.place) formData.append("place", boatData.place); // FIX: Added
      if (boatData.description)
        formData.append("description", boatData.description);
      if (boatData.price1h) formData.append("price1h", boatData.price1h);
      if (boatData.price2h) formData.append("price2h", boatData.price2h);
      if (boatData.price3h) formData.append("price3h", boatData.price3h); // FIX: Added
      if (boatData.price4h) formData.append("price4h", boatData.price4h); // FIX: Added
      if (boatData.capacity) formData.append("capacity", boatData.capacity);

      if (boatData.image && typeof boatData.image !== "string") {
        formData.append("image", boatData.image);
      }

      const response = await api.put(`/boats/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set((state) => ({
        boats: state.boats.map((boat) =>
          boat._id === id ? response.data : boat
        ),
        loading: false,
      }));

      toast.success("تم تحديث القارب بنجاح");
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "فشل في تحديث القارب";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  deleteBoat: async (id) => {
    set({ loading: true, error: null });

    try {
      await api.delete(`/boats/${id}`);

      // Remove boat from state
      set((state) => ({
        boats: state.boats.filter((boat) => boat._id !== id),
        loading: false,
      }));

      toast.success("تم حذف القارب بنجاح");
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "فشل في حذف القارب";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  resetStore: () => {
    set({
      boats: [],
      loading: false,
      error: null,
    });
  },
}));

export default useBoatsStore;
