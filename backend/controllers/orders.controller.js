import Order from "../models/order.model.js";
import Boat from "../models/boat.model.js";
import mongoose from "mongoose";
import { sendBookingNotifications } from "../services/nodemailer.service.js";

// ============================================
// CONSTANTS
// ============================================
const TIME_SLOTS = [
  { start: "09:00", end: "10:00" },
  { start: "10:30", end: "11:30" },
  { start: "12:00", end: "13:00" },
  { start: "13:30", end: "14:30" },
  { start: "15:00", end: "16:00" },
  { start: "16:30", end: "17:30" },
  { start: "18:00", end: "19:00" },
  { start: "19:30", end: "20:30" },
];

const SLOT_START_TIMES = TIME_SLOTS.map((slot) => slot.start);

// ============================================
// HELPER FUNCTIONS
// ============================================
const calculateEndTime = (startTime, duration) => {
  const startIndex = TIME_SLOTS.findIndex((slot) => slot.start === startTime);
  if (startIndex === -1) return startTime;

  const endIndex = startIndex + (duration - 1);
  if (endIndex < TIME_SLOTS.length) {
    return TIME_SLOTS[endIndex].end;
  }
  return startTime;
};

const calculateTotalPrice = (boat, duration) => {
  const prices = {
    1: boat.price1h,
    2: boat.price2h,
    3: boat.price3h,
    4: boat.price4h,
  };
  return prices[duration] || 0;
};

// ============================================
// PUBLIC ROUTES (For clients)
// ============================================

// Get available time slots for a specific boat on a specific date
export const getAvailableSlots = async (req, res) => {
  try {
    const { boatId, date } = req.query;

    if (!boatId || !date) {
      return res.status(400).json({ message: "معرف القارب والتاريخ مطلوبان" });
    }

    if (!mongoose.Types.ObjectId.isValid(boatId)) {
      return res.status(400).json({ message: "معرف القارب غير صالح" });
    }

    // Check if boat exists
    const boat = await Boat.findById(boatId).select("_id title place");
    if (!boat) {
      return res.status(404).json({ message: "القارب غير موجود" });
    }

    // Validate date format
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ message: "صيغة التاريخ غير صالحة" });
    }

    // Get available slots using the static method
    const availableSlots = await Order.getAvailableSlots(boatId, bookingDate);

    res.status(200).json({
      boatId: boat._id,
      boatName: boat.title,
      boatPlace: boat.place,
      date: date,
      availableSlots: availableSlots,
    });
  } catch (error) {
    console.error("Get available slots error:", error);
    res.status(500).json({ message: "فشل في جلب المواعيد المتاحة" });
  }
};

// Create a new booking (public)
export const createOrder = async (req, res) => {
  try {
    const {
      boatId,
      customerName,
      customerPhone,
      customerEmail,
      bookingDate,
      startTime,
      duration,
      numberOfPeople,
      specialRequests,
    } = req.body;

    console.log("📥 Received order data:", {
      boatId,
      customerName,
      customerPhone,
      customerEmail,
      bookingDate,
      startTime,
      duration,
      numberOfPeople,
      specialRequests,
    });

    // Validation
    if (
      !boatId ||
      !customerName ||
      !customerPhone ||
      !bookingDate ||
      !startTime ||
      !duration
    ) {
      console.log("❌ Missing required fields");
      return res
        .status(400)
        .json({ message: "جميع الحقول المطلوبة يجب ملؤها" });
    }

    // Validate boat ID
    if (!mongoose.Types.ObjectId.isValid(boatId)) {
      return res.status(400).json({ message: "معرف القارب غير صالح" });
    }

    // Validate start time
    if (!SLOT_START_TIMES.includes(startTime)) {
      return res.status(400).json({ message: "وقت البداية غير صالح" });
    }

    // Validate duration
    if (![1, 2, 3, 4].includes(Number(duration))) {
      return res
        .status(400)
        .json({ message: "المدة يجب أن تكون 1، 2، 3، أو 4 ساعات" });
    }

    // Check if boat exists
    const boat = await Boat.findById(boatId);
    if (!boat) {
      console.log("❌ Boat not found:", boatId);
      return res.status(404).json({ message: "القارب غير موجود" });
    }

    console.log("✅ Boat found:", boat.title);

    // Validate booking date (not in past)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDay = new Date(bookingDate);
    bookingDay.setHours(0, 0, 0, 0);

    if (bookingDay < today) {
      return res.status(400).json({ message: "لا يمكن الحجز في تاريخ سابق" });
    }

    // Validate number of people against boat capacity
    if (numberOfPeople && Number(numberOfPeople) > boat.capacity) {
      return res.status(400).json({
        message: `عدد الأشخاص يتجاوز سعة القارب (الحد الأقصى: ${boat.capacity} أشخاص)`,
      });
    }

    // Check if slot is available
    const isAvailable = await Order.isSlotAvailable(
      boatId,
      bookingDate,
      startTime,
      Number(duration)
    );

    if (!isAvailable) {
      console.log("❌ Slot not available");
      return res
        .status(400)
        .json({ message: "الوقت المحدد غير متاح، يرجى اختيار وقت آخر" });
    }

    console.log("✅ Slot is available");

    // Calculate endTime and totalPrice
    const endTime = calculateEndTime(startTime, Number(duration));
    const totalPrice = calculateTotalPrice(boat, Number(duration));

    console.log("💰 Calculated:", { startTime, duration, endTime, totalPrice });

    // Check if boat prices are complete
    if (!boat.price1h || !boat.price2h || !boat.price3h || !boat.price4h) {
      console.error("❌ Incomplete boat price data:", {
        price1h: boat.price1h,
        price2h: boat.price2h,
        price3h: boat.price3h,
        price4h: boat.price4h,
      });
      return res.status(400).json({
        message: "بيانات أسعار القارب غير مكتملة. يرجى التواصل مع الإدارة.",
      });
    }

    // Create order
    const order = new Order({
      boatId: boat._id,
      boatName: boat.title,
      boatPlace: boat.place,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || undefined,
      bookingDate,
      startTime,
      endTime,
      duration: Number(duration),
      numberOfPeople: numberOfPeople ? Number(numberOfPeople) : undefined,
      specialRequests: specialRequests?.trim() || undefined,
      price1h: boat.price1h,
      price2h: boat.price2h,
      price3h: boat.price3h,
      price4h: boat.price4h,
      totalPrice,
      status: "pending",
    });

    console.log("📝 Saving order to database...");
    await order.save();
    console.log("✅ Order saved successfully:", order._id);

    // FIX: Send email notifications (non-blocking)
    sendBookingNotifications(order).catch((err) => {
      console.error("❌ Email notification error:", err.message);
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: "تم إنشاء الحجز بنجاح، في انتظار التأكيد",
      order: {
        _id: order._id,
        boatName: order.boatName,
        boatPlace: order.boatPlace,
        bookingDate: order.formattedDate,
        timeRange: order.timeRange,
        totalPrice: order.totalPrice,
        status: order.status,
        statusArabic: order.statusArabic,
      },
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    console.error("Error details:", error.message);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: "هذا الحجز موجود مسبقاً" });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      console.error("Validation errors:", messages);
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({
      message: "فشل في إنشاء الحجز",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get order by ID (public - for tracking) - LIMITED INFO
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرف الحجز غير صالح" });
    }

    const order = await Order.findById(id)
      .select(
        "boatName bookingDate startTime endTime duration totalPrice status createdAt"
      )
      .lean();

    if (!order) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }

    const formattedOrder = {
      ...order,
      formattedDate: new Date(order.bookingDate).toLocaleDateString("ar-DZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      timeRange: `${order.startTime} - ${order.endTime}`,
      statusArabic:
        {
          pending: "قيد الانتظار",
          confirmed: "مؤكد",
          cancelled: "ملغي",
          completed: "مكتمل",
        }[order.status] || order.status,
    };

    res.status(200).json(formattedOrder);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "فشل في جلب الحجز" });
  }
};

// Cancel order (public - with 24h restriction)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرف الحجز غير صالح" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }

    if (!order.canBeCancelled()) {
      return res.status(400).json({
        message: "لا يمكن إلغاء الحجز قبل 24 ساعة من موعد الرحلة",
      });
    }

    order.status = "cancelled";
    if (reason) {
      order.adminNotes = `[إلغاء من العميل] ${reason}`;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "تم إلغاء الحجز بنجاح",
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "فشل في إلغاء الحجز" });
  }
};

// ============================================
// PROTECTED ROUTES (Admin only)
// ============================================

// Get all orders (admin) - with pagination and filters
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      boatId,
      startDate,
      endDate,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    if (status) {
      const statuses = status.split(",");
      query.status = { $in: statuses };
    }

    if (boatId && mongoose.Types.ObjectId.isValid(boatId)) {
      query.boatId = boatId;
    }

    if (startDate || endDate) {
      query.bookingDate = {};
      if (startDate) {
        query.bookingDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.bookingDate.$lte = new Date(endDate);
      }
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
        { boatName: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "فشل في جلب الحجوزات" });
  }
};

// Get order by ID (admin) - FULL INFO
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرف الحجز غير صالح" });
    }

    const order = await Order.findById(id)
      .populate("boatId", "title place capacity image")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Get order admin error:", error);
    res.status(500).json({ message: "فشل في جلب الحجز" });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرف الحجز غير صالح" });
    }

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "حالة غير صالحة" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }

    if (status === "confirmed") {
      const isAvailable = await Order.isSlotAvailable(
        order.boatId,
        order.bookingDate,
        order.startTime,
        order.duration,
        id
      );

      if (!isAvailable) {
        return res.status(400).json({
          message: "لا يمكن تأكيد الحجز لوجود تعارض مع حجز آخر",
        });
      }
    }

    if (
      (order.status === "completed" || order.status === "cancelled") &&
      status === "pending"
    ) {
      return res.status(400).json({
        message: `لا يمكن إعادة الحجز ${order.statusArabic} إلى قيد الانتظار`,
      });
    }

    const oldStatus = order.status;
    order.status = status;

    if (adminNotes) {
      const timestamp = new Date().toLocaleString("ar-DZ");
      const newNote = `[${timestamp}] تم تغيير الحالة من ${oldStatus} إلى ${status}. ${adminNotes}`;
      order.adminNotes = order.adminNotes
        ? `${order.adminNotes}\n${newNote}`
        : newNote;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `تم تحديث حالة الحجز إلى ${order.statusArabic}`,
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "فشل في تحديث حالة الحجز" });
  }
};

// Delete order (admin only)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرف الحجز غير صالح" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }

    await Order.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "تم حذف الحجز بنجاح",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ message: "فشل في حذف الحجز" });
  }
};

// Get orders for a specific boat on a date (admin)
export const getBoatOrdersByDate = async (req, res) => {
  try {
    const { boatId, date } = req.query;

    if (!boatId || !date) {
      return res.status(400).json({ message: "معرف القارب والتاريخ مطلوبان" });
    }

    if (!mongoose.Types.ObjectId.isValid(boatId)) {
      return res.status(400).json({ message: "معرف القارب غير صالح" });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      boatId: boatId,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "cancelled" },
    })
      .select("customerName customerPhone startTime endTime duration status")
      .sort({ startTime: 1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get boat orders error:", error);
    res.status(500).json({ message: "فشل في جلب حجوزات القارب" });
  }
};

// Get order statistics (admin dashboard)
export const getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      completedOrders,
      cancelledOrders,
      todayOrders,
      monthlyOrders,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "confirmed" }),
      Order.countDocuments({ status: "completed" }),
      Order.countDocuments({ status: "cancelled" }),
      Order.countDocuments({ bookingDate: { $gte: today, $lt: tomorrow } }),
      Order.find({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        status: { $in: ["confirmed", "completed"] },
      }).select("totalPrice"),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("customerName boatName bookingDate startTime totalPrice status")
        .lean(),
    ]);

    const monthlyRevenue = monthlyOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    const upcomingBookings = await Order.find({
      bookingDate: { $gte: today },
      status: "confirmed",
    })
      .sort({ bookingDate: 1, startTime: 1 })
      .limit(5)
      .select("customerName boatName bookingDate startTime")
      .lean();

    res.status(200).json({
      counts: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        today: todayOrders,
      },
      monthlyRevenue,
      recentOrders,
      upcomingBookings,
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({ message: "فشل في جلب الإحصائيات" });
  }
};
