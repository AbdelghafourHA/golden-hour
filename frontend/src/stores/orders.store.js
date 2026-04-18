import { create } from "zustand";
import api from "../api/axios";
import { toast } from "react-hot-toast";

// All possible time slots
const ALL_TIME_SLOTS = [
  "09:00",
  "10:30",
  "12:00",
  "13:30",
  "15:00",
  "16:30",
  "18:00",
  "19:30",
];

const useOrdersStore = create((set, get) => ({
  // State
  orders: [],
  selectedOrder: null,
  availableSlots: [],
  loading: false,
  error: null,

  // FIX: Track current context for optimistic updates
  currentContext: {
    boatId: null,
    date: null,
  },

  // Statistics
  stats: {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    today: 0,
    monthlyRevenue: 0,
    recentOrders: [],
    upcomingBookings: [],
  },

  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 20,
  },

  // ============================================
  // PUBLIC ACTIONS (For clients)
  // ============================================

  // Get available time slots for a boat on a specific date
  getAvailableSlots: async (boatId, date) => {
    set({ loading: true, error: null });

    try {
      const response = await api.get("/orders/available-slots", {
        params: { boatId, date },
      });

      // FIX: Save context for optimistic updates
      set({
        availableSlots: response.data.availableSlots,
        currentContext: { boatId, date },
        loading: false,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Get available slots error:", error);
      const errorMessage =
        error.response?.data?.message || "فشل في جلب المواعيد المتاحة";

      set({
        loading: false,
        error: errorMessage,
        availableSlots: [],
        currentContext: { boatId: null, date: null },
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Create a new booking (public) with optimistic update
  createOrder: async (orderData) => {
    set({ loading: true, error: null });

    try {
      const response = await api.post("/orders", orderData);

      // FIX: Optimistically update available slots
      const { availableSlots, currentContext } = get();

      // Only update if we're viewing the same boat and date
      if (
        currentContext.boatId === orderData.boatId &&
        currentContext.date === orderData.bookingDate
      ) {
        const startIndex = ALL_TIME_SLOTS.indexOf(orderData.startTime);
        const slotsToRemove = [];

        // Mark all slots in the duration as booked
        for (let i = 0; i < orderData.duration; i++) {
          if (startIndex + i < ALL_TIME_SLOTS.length) {
            slotsToRemove.push(ALL_TIME_SLOTS[startIndex + i]);
          }
        }

        // Update availableSlots optimistically
        set({
          availableSlots: availableSlots.filter(
            (slot) => !slotsToRemove.includes(slot)
          ),
        });
      }

      set({ loading: false });
      toast.success("تم إنشاء الحجز بنجاح، في انتظار التأكيد");

      return {
        success: true,
        data: response.data.order,
      };
    } catch (error) {
      console.error("Create order error:", error);

      // FIX: On error, refetch to ensure correct state
      const { currentContext } = get();
      if (currentContext.boatId && currentContext.date) {
        await get().getAvailableSlots(
          currentContext.boatId,
          currentContext.date
        );
      }

      let errorMessage = "فشل في إنشاء الحجز";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Get order by ID (for tracking) - LIMITED INFO
  getOrderById: async (id) => {
    set({ loading: true, error: null });

    try {
      const response = await api.get(`/orders/${id}`);

      set({
        selectedOrder: response.data,
        loading: false,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Get order error:", error);
      const errorMessage = error.response?.data?.message || "الحجز غير موجود";

      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Cancel order (public - with 24h restriction)
  cancelOrder: async (id, reason = "") => {
    set({ loading: true, error: null });

    try {
      const response = await api.put(`/orders/${id}/cancel`, { reason });

      // Update selected order if it matches
      set((state) => ({
        selectedOrder:
          state.selectedOrder?._id === id
            ? { ...state.selectedOrder, status: "cancelled" }
            : state.selectedOrder,
        loading: false,
      }));

      // FIX: Refetch available slots if we have context
      const { currentContext } = get();
      if (currentContext.boatId && currentContext.date) {
        await get().getAvailableSlots(
          currentContext.boatId,
          currentContext.date
        );
      }

      toast.success("تم إلغاء الحجز بنجاح");
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Cancel order error:", error);
      const errorMessage =
        error.response?.data?.message || "فشل في إلغاء الحجز";

      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // ============================================
  // ADMIN ACTIONS (Protected)
  // ============================================

  // Get all orders with filtering and pagination
  fetchOrders: async (filters = {}) => {
    set({ loading: true, error: null });

    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.status) params.append("status", filters.status);
      if (filters.boatId) params.append("boatId", filters.boatId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.search) params.append("search", filters.search);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response = await api.get(`/orders?${params.toString()}`);

      set({
        orders: response.data.orders,
        pagination: response.data.pagination,
        loading: false,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Fetch orders error:", error);
      const errorMessage =
        error.response?.data?.message || "فشل في جلب الحجوزات";

      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Refresh orders (keeps current filters)
  refreshOrders: async () => {
    const { pagination } = get();
    return get().fetchOrders({
      page: pagination.currentPage,
      limit: pagination.limit,
    });
  },

  // Get orders for a specific boat on a date
  fetchBoatOrdersByDate: async (boatId, date) => {
    set({ loading: true, error: null });

    try {
      const response = await api.get("/orders/boat/day", {
        params: { boatId, date },
      });

      set({ loading: false });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Fetch boat orders error:", error);
      const errorMessage =
        error.response?.data?.message || "فشل في جلب حجوزات القارب";

      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update order status (admin)
  updateOrderStatus: async (id, status, adminNotes = "") => {
    set({ loading: true, error: null });

    try {
      const response = await api.put(`/orders/${id}/status`, {
        status,
        adminNotes,
      });

      // Update orders list
      set((state) => ({
        orders: state.orders.map((order) =>
          order._id === id ? response.data.order : order
        ),
        selectedOrder:
          state.selectedOrder?._id === id
            ? response.data.order
            : state.selectedOrder,
        loading: false,
      }));

      // Refresh stats after status change
      get().fetchStats();

      // FIX: If order was cancelled, refetch available slots
      if (status === "cancelled") {
        const { currentContext } = get();
        if (currentContext.boatId && currentContext.date) {
          await get().getAvailableSlots(
            currentContext.boatId,
            currentContext.date
          );
        }
      }

      toast.success(response.data.message);
      return {
        success: true,
        data: response.data.order,
      };
    } catch (error) {
      console.error("Update order status error:", error);

      let errorMessage =
        error.response?.data?.message || "فشل في تحديث حالة الحجز";

      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Delete order (admin only)
  deleteOrder: async (id) => {
    set({ loading: true, error: null });

    try {
      // Get order details before deletion to know boatId and date
      const order = get().orders.find((o) => o._id === id);

      await api.delete(`/orders/${id}`);

      // Remove from orders list
      set((state) => ({
        orders: state.orders.filter((order) => order._id !== id),
        selectedOrder:
          state.selectedOrder?._id === id ? null : state.selectedOrder,
        loading: false,
      }));

      // Refresh stats after deletion
      get().fetchStats();

      // FIX: Refetch available slots if we have context and it matches
      const { currentContext } = get();
      if (
        order &&
        currentContext.boatId === order.boatId &&
        currentContext.date
      ) {
        // Convert date to YYYY-MM-DD if needed
        const orderDate = new Date(order.bookingDate)
          .toISOString()
          .split("T")[0];
        if (orderDate === currentContext.date) {
          await get().getAvailableSlots(
            currentContext.boatId,
            currentContext.date
          );
        }
      }

      toast.success("تم حذف الحجز بنجاح");
      return { success: true };
    } catch (error) {
      console.error("Delete order error:", error);
      const errorMessage = error.response?.data?.message || "فشل في حذف الحجز";

      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Bulk delete orders
  bulkDeleteOrders: async (ids) => {
    set({ loading: true, error: null });

    try {
      // Delete sequentially
      for (const id of ids) {
        await api.delete(`/orders/${id}`);
      }

      // Remove from orders list
      set((state) => ({
        orders: state.orders.filter((order) => !ids.includes(order._id)),
        loading: false,
      }));

      get().fetchStats();

      // FIX: Refetch available slots
      const { currentContext } = get();
      if (currentContext.boatId && currentContext.date) {
        await get().getAvailableSlots(
          currentContext.boatId,
          currentContext.date
        );
      }

      toast.success(`تم حذف ${ids.length} حجز بنجاح`);
      return { success: true };
    } catch (error) {
      console.error("Bulk delete error:", error);
      const errorMessage =
        error.response?.data?.message || "فشل في حذف الحجوزات";

      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Get order statistics for dashboard
  fetchStats: async () => {
    try {
      const response = await api.get("/orders/stats/dashboard");

      set({ stats: response.data });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Fetch stats error:", error);
      return { success: false };
    }
  },

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  // Clear selected order
  clearSelectedOrder: () => {
    set({ selectedOrder: null });
  },

  // Clear available slots
  clearAvailableSlots: () => {
    set({
      availableSlots: [],
      currentContext: { boatId: null, date: null },
    });
  },

  // Reset store (for logout)
  resetStore: () => {
    set({
      orders: [],
      selectedOrder: null,
      availableSlots: [],
      loading: false,
      error: null,
      currentContext: {
        boatId: null,
        date: null,
      },
      stats: {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        today: 0,
        monthlyRevenue: 0,
        recentOrders: [],
        upcomingBookings: [],
      },
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        limit: 20,
      },
    });
  },

  // Get order status in Arabic
  getStatusArabic: (status) => {
    const statusMap = {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      cancelled: "ملغي",
      completed: "مكتمل",
    };
    return statusMap[status] || status;
  },

  // Get status color classes
  getStatusClasses: (status) => {
    const classes = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      confirmed: "bg-green-100 text-green-700 border-green-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
      completed: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return classes[status] || "bg-gray-100 text-gray-700 border-gray-200";
  },

  // Get status badge variant
  getStatusVariant: (status) => {
    const variants = {
      pending: "warning",
      confirmed: "success",
      cancelled: "danger",
      completed: "info",
    };
    return variants[status] || "default";
  },

  // Filter orders by status
  filterByStatus: (status) => {
    const orders = get().orders;
    if (status === "all") return orders;
    return orders.filter((order) => order.status === status);
  },

  // Filter orders by boat
  filterByBoat: (boatId) => {
    const orders = get().orders;
    if (!boatId) return orders;
    return orders.filter((order) => order.boatId === boatId);
  },

  // Filter orders by date range
  filterByDateRange: (startDate, endDate) => {
    const orders = get().orders;
    return orders.filter((order) => {
      const orderDate = new Date(order.bookingDate);
      if (startDate && orderDate < new Date(startDate)) return false;
      if (endDate && orderDate > new Date(endDate)) return false;
      return true;
    });
  },

  // Search orders by customer name, phone, or boat
  searchOrders: (searchTerm) => {
    const orders = get().orders;
    if (!searchTerm) return orders;

    const term = searchTerm.toLowerCase();
    return orders.filter(
      (order) =>
        order.customerName?.toLowerCase().includes(term) ||
        order.customerPhone?.includes(term) ||
        order.boatName?.toLowerCase().includes(term)
    );
  },

  // Get today's orders
  getTodayOrders: () => {
    const orders = get().orders;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return orders.filter((order) => {
      const orderDate = new Date(order.bookingDate);
      return orderDate >= today && orderDate < tomorrow;
    });
  },

  // Get upcoming orders
  getUpcomingOrders: () => {
    const orders = get().orders;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return orders
      .filter((order) => {
        const orderDate = new Date(order.bookingDate);
        return orderDate >= today && order.status !== "cancelled";
      })
      .sort((a, b) => {
        const dateA = new Date(a.bookingDate + " " + a.startTime);
        const dateB = new Date(b.bookingDate + " " + b.startTime);
        return dateA - dateB;
      });
  },

  // Get orders by specific date
  getOrdersByDate: (date) => {
    const orders = get().orders;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    return orders.filter((order) => {
      const orderDate = new Date(order.bookingDate);
      return orderDate >= targetDate && orderDate < nextDate;
    });
  },

  // Check if time slot is available (client-side check)
  isSlotAvailable: (boatId, date, startTime, duration) => {
    const orders = get().orders;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const boatOrders = orders.filter((order) => {
      const orderDate = new Date(order.bookingDate);
      return (
        order.boatId === boatId &&
        orderDate >= targetDate &&
        orderDate < nextDate &&
        ["pending", "confirmed"].includes(order.status)
      );
    });

    const requestedSlots = [];
    const startIndex = ALL_TIME_SLOTS.indexOf(startTime);

    for (let i = 0; i < duration; i++) {
      if (startIndex + i < ALL_TIME_SLOTS.length) {
        requestedSlots.push(ALL_TIME_SLOTS[startIndex + i]);
      }
    }

    for (const order of boatOrders) {
      const orderStartIndex = ALL_TIME_SLOTS.indexOf(order.startTime);
      for (let i = 0; i < order.duration; i++) {
        const bookedSlot = ALL_TIME_SLOTS[orderStartIndex + i];
        if (requestedSlots.includes(bookedSlot)) {
          return false;
        }
      }
    }

    return true;
  },
}));

export default useOrdersStore;
