import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Customer Information
    customerName: {
      type: String,
      required: [true, "اسم العميل مطلوب"],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "رقم الهاتف مطلوب"],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // Boat Reference
    boatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boat",
      required: [true, "القارب مطلوب"],
    },
    boatName: {
      type: String,
      required: true,
    },
    boatPlace: {
      type: String,
      required: true,
    },

    // Booking Details
    bookingDate: {
      type: Date,
      required: [true, "تاريخ الحجز مطلوب"],
      validate: {
        validator: function (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const bookingDay = new Date(value);
          bookingDay.setHours(0, 0, 0, 0);
          return bookingDay >= today;
        },
        message: "تاريخ الحجز يجب أن يكون اليوم أو في المستقبل",
      },
    },
    startTime: {
      type: String,
      required: [true, "وقت البداية مطلوب"],
      enum: [
        "09:00",
        "10:30",
        "12:00",
        "13:30",
        "15:00",
        "16:30",
        "18:00",
        "19:30",
      ],
    },
    duration: {
      type: Number,
      required: [true, "المدة مطلوبة"],
      enum: [1, 2, 3, 4],
    },
    endTime: {
      type: String,
    },

    // Pricing (Copied from Boat at booking time)
    price1h: {
      type: Number,
      required: true,
      min: [0, "السعر يجب أن يكون أكبر من 0"],
    },
    price2h: {
      type: Number,
      required: true,
      min: [0, "السعر يجب أن يكون أكبر من 0"],
    },
    price3h: {
      type: Number,
      required: true,
      min: [0, "السعر يجب أن يكون أكبر من 0"],
    },
    price4h: {
      type: Number,
      required: true,
      min: [0, "السعر يجب أن يكون أكبر من 0"],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "السعر الإجمالي يجب أن يكون أكبر من 0"],
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    // Additional Info
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [500, "الطلبات الخاصة لا تتجاوز 500 حرف"],
    },
    numberOfPeople: {
      type: Number,
      min: [1, "عدد الأشخاص يجب أن يكون 1 على الأقل"],
    },

    // Admin Notes
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // FIX: Include virtuals in JSON output
    toObject: { virtuals: true }, // FIX: Include virtuals in object output
  }
);

// ============================================
// INDEXES
// ============================================
orderSchema.index({ bookingDate: 1, boatId: 1, status: 1 });
orderSchema.index({ customerPhone: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
// FIX: Compound index for availability queries
orderSchema.index({ boatId: 1, bookingDate: 1, startTime: 1, status: 1 });

// ============================================
// VIRTUALS
// ============================================
orderSchema.virtual("formattedDate").get(function () {
  if (!this.bookingDate) return "";
  return new Date(this.bookingDate).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

orderSchema.virtual("timeRange").get(function () {
  if (!this.startTime || !this.endTime) return "";
  return `${this.startTime} - ${this.endTime}`;
});

orderSchema.virtual("statusArabic").get(function () {
  const statusMap = {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    cancelled: "ملغي",
    completed: "مكتمل",
  };
  return statusMap[this.status] || this.status;
});

orderSchema.virtual("statusColor").get(function () {
  const colorMap = {
    pending: "yellow",
    confirmed: "green",
    cancelled: "red",
    completed: "blue",
  };
  return colorMap[this.status] || "gray";
});

// FIX: Virtual for total duration including breaks
orderSchema.virtual("totalDurationWithBreaks").get(function () {
  return this.duration + (this.duration - 1) * 0.5;
});

// ============================================
// STATIC METHODS
// ============================================
orderSchema.statics.getAvailableSlots = async function (boatId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await this.find({
    boatId: boatId,
    bookingDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    status: { $in: ["pending", "confirmed"] },
  });

  const allSlots = [
    "09:00",
    "10:30",
    "12:00",
    "13:30",
    "15:00",
    "16:30",
    "18:00",
    "19:30",
  ];

  const bookedSlots = new Set();

  bookings.forEach((booking) => {
    const startIndex = allSlots.indexOf(booking.startTime);
    for (let i = 0; i < booking.duration; i++) {
      if (startIndex + i < allSlots.length) {
        bookedSlots.add(allSlots[startIndex + i]);
      }
    }
  });

  return allSlots.filter((slot) => !bookedSlots.has(slot));
};

// FIX: Updated to accept excludeOrderId parameter
orderSchema.statics.isSlotAvailable = async function (
  boatId,
  date,
  startTime,
  duration,
  excludeOrderId = null // FIX: Added parameter to exclude current order
) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // FIX: Build query with excludeOrderId
  const query = {
    boatId: boatId,
    bookingDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    status: { $in: ["pending", "confirmed"] },
  };

  if (excludeOrderId) {
    query._id = { $ne: excludeOrderId };
  }

  const existingBookings = await this.find(query);

  const allSlots = [
    "09:00",
    "10:30",
    "12:00",
    "13:30",
    "15:00",
    "16:30",
    "18:00",
    "19:30",
  ];

  const requestedSlots = [];
  const startIndex = allSlots.indexOf(startTime);

  for (let i = 0; i < duration; i++) {
    if (startIndex + i < allSlots.length) {
      requestedSlots.push(allSlots[startIndex + i]);
    }
  }

  for (const booking of existingBookings) {
    const bookingStartIndex = allSlots.indexOf(booking.startTime);
    for (let i = 0; i < booking.duration; i++) {
      const bookedSlot = allSlots[bookingStartIndex + i];
      if (requestedSlots.includes(bookedSlot)) {
        return false;
      }
    }
  }

  return true;
};

// FIX: New static method to get bookings by date range
orderSchema.statics.getBookingsByDateRange = async function (
  boatId,
  startDate,
  endDate
) {
  return this.find({
    boatId: boatId,
    bookingDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    status: { $in: ["pending", "confirmed"] },
  }).sort({ bookingDate: 1, startTime: 1 });
};

// FIX: New static method to check if boat has any confirmed bookings
orderSchema.statics.hasConfirmedBookings = async function (boatId) {
  const count = await this.countDocuments({
    boatId: boatId,
    status: "confirmed",
  });
  return count > 0;
};

// ============================================
// INSTANCE METHODS
// ============================================
orderSchema.methods.canBeCancelled = function () {
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  const [hours, minutes] = this.startTime.split(":");
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

  const hoursDifference = (bookingDateTime - now) / (1000 * 60 * 60);
  return (
    hoursDifference > 24 &&
    this.status !== "cancelled" &&
    this.status !== "completed"
  );
};

orderSchema.methods.canBeModified = function () {
  return this.status === "pending";
};

orderSchema.methods.markAsCompleted = async function () {
  this.status = "completed";
  return this.save();
};

orderSchema.methods.addAdminNote = async function (note) {
  const timestamp = new Date().toLocaleString("ar-DZ");
  const newNote = `[${timestamp}] ${note}`;
  this.adminNotes = this.adminNotes
    ? `${this.adminNotes}\n${newNote}`
    : newNote;
  return this.save();
};

const Order = mongoose.model("Order", orderSchema);
export default Order;
