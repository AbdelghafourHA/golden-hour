import express from "express";
import {
  getAvailableSlots,
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getBoatOrdersByDate,
  getOrderStats,
  cancelOrder,
} from "../controllers/orders.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Get available time slots for a boat on a specific date
// GET /api/orders/available-slots?boatId=xxx&date=2026-05-20
router.get("/available-slots", getAvailableSlots);

// Create a new booking (public)
// POST /api/orders
router.post("/", createOrder);

// Cancel order (public - with 24h restriction)
// PUT /api/orders/:id/cancel
router.put("/:id/cancel", cancelOrder);

// ============================================
// PROTECTED ROUTES (Admin only)
// ============================================

// Get order statistics for dashboard
// GET /api/orders/stats/dashboard
router.get("/stats/dashboard", protect, getOrderStats);

// Get all orders with filtering and pagination
// GET /api/orders?page=1&limit=20&status=pending&boatId=xxx&search=xxx
router.get("/", protect, getAllOrders);

// Get orders for a specific boat on a specific date
// GET /api/orders/boat/day?boatId=xxx&date=2026-05-20
router.get("/boat/day", protect, getBoatOrdersByDate);

// Get order by ID (admin only)
// GET /api/orders/:id
router.get("/:id", protect, getOrderById); // FIX: Now protected

// Update order status (confirm/cancel/complete)
// PUT /api/orders/:id/status
router.put("/:id/status", protect, updateOrderStatus);

// Delete order (admin only)
// DELETE /api/orders/:id
router.delete("/:id", protect, deleteOrder);

export default router;
