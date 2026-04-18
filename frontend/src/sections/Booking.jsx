import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import useBoatsStore from "../stores/boats.store";
import useOrdersStore from "../stores/orders.store";

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

export default function Booking() {
  const { boats, loading: boatsLoading, fetchBoats } = useBoatsStore();
  const {
    availableSlots,
    loading: ordersLoading,
    getAvailableSlots,
    createOrder,
  } = useOrdersStore();

  // Form state
  const [selectedBoatId, setSelectedBoatId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [duration, setDuration] = useState(1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    numberOfPeople: "",
    specialRequests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  }, []);

  const selectedBoat = useMemo(() => {
    return boats.find((b) => b._id === selectedBoatId);
  }, [boats, selectedBoatId]);

  useEffect(() => {
    if (boats.length > 0 && !selectedBoatId) {
      setSelectedBoatId(boats[0]._id);
    }
  }, [boats, selectedBoatId]);

  useEffect(() => {
    if (selectedBoatId && selectedDate) {
      getAvailableSlots(selectedBoatId, selectedDate);
    }
  }, [selectedBoatId, selectedDate, getAvailableSlots]);

  useEffect(() => {
    setSelectedTimeSlot("");
  }, [duration]);

  // Get taken slots (all slots - available slots)
  const takenSlots = useMemo(() => {
    return ALL_TIME_SLOTS.filter((slot) => !availableSlots.includes(slot));
  }, [availableSlots]);

  // Check if selected time slot is valid for the duration
  const isSlotValidForDuration = (slot, dur) => {
    const startIndex = ALL_TIME_SLOTS.indexOf(slot);
    if (startIndex === -1) return false;

    for (let i = 0; i < dur; i++) {
      const currentSlot = ALL_TIME_SLOTS[startIndex + i];
      if (!currentSlot || !availableSlots.includes(currentSlot)) {
        return false;
      }
    }
    return true;
  };

  // Get available slots that can accommodate the selected duration
  const validSlotsForDuration = useMemo(() => {
    return availableSlots.filter((slot) =>
      isSlotValidForDuration(slot, duration)
    );
  }, [availableSlots, duration]);

  // Get slot status (available, taken, or available-for-other-duration)
  const getSlotStatus = (slot) => {
    if (takenSlots.includes(slot)) return "taken";
    if (validSlotsForDuration.includes(slot)) return "available";
    return "available-other-duration";
  };

  // Get slot label
  const getSlotLabel = (slot) => {
    return slot;
  };

  const calculatedPrice = useMemo(() => {
    if (!selectedBoat) return 0;
    const prices = {
      1: selectedBoat.price1h,
      2: selectedBoat.price2h,
      3: selectedBoat.price3h,
      4: selectedBoat.price4h,
    };
    return prices[duration] || 0;
  }, [selectedBoat, duration]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBoatId) {
      toast.error("يرجى اختيار القارب");
      return;
    }
    if (!selectedDate) {
      toast.error("يرجى اختيار التاريخ");
      return;
    }
    if (!selectedTimeSlot) {
      toast.error("يرجى اختيار الوقت");
      return;
    }
    if (!formData.customerName.trim()) {
      toast.error("يرجى إدخال الاسم الكامل");
      return;
    }
    if (!formData.customerPhone.trim()) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }
    if (!formData.numberOfPeople || formData.numberOfPeople < 1) {
      toast.error("يرجى إدخال عدد الأشخاص");
      return;
    }
    if (formData.numberOfPeople > selectedBoat?.capacity) {
      toast.error(`السعة القصوى للقارب هي ${selectedBoat.capacity} أشخاص`);
      return;
    }

    if (
      !selectedBoat?.price1h ||
      !selectedBoat?.price2h ||
      !selectedBoat?.price3h ||
      !selectedBoat?.price4h
    ) {
      toast.error("بيانات أسعار القارب غير مكتملة. يرجى التواصل مع الإدارة.");
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      boatId: selectedBoatId,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail || undefined,
      bookingDate: selectedDate,
      startTime: selectedTimeSlot,
      duration: duration,
      numberOfPeople: Number(formData.numberOfPeople),
      specialRequests: formData.specialRequests || undefined,
    };

    const result = await createOrder(orderData);
    setIsSubmitting(false);

    if (result.success) {
      setFormData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        numberOfPeople: "",
        specialRequests: "",
      });
      setSelectedDate("");
      setSelectedTimeSlot("");
      setDuration(1);
      toast.success("تم إرسال طلب الحجز بنجاح! سنتواصل معك قريباً للتأكيد.");
    }
  };

  const getDurationLabel = (dur) => {
    const labels = {
      1: "ساعة واحدة",
      2: "ساعتين",
      3: "3 ساعات",
      4: "4 ساعات",
    };
    return labels[dur] || `${dur} ساعات`;
  };

  // Helper to get Arabic place name
  const getPlaceArabic = (place) => {
    const placeMap = {
      "ميناء تيبازة": "ميناء تيبازة",
      "ميناء شرشال": "ميناء شرشال",
      "القرن الذهبي": "القرن الذهبي",
    };
    return placeMap[place] || place;
  };

  if (boatsLoading && boats.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="container text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      id="Booking"
      initial={{ opacity: 0, y: -60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="py-20 bg-white"
      dir="rtl"
    >
      <div className="container">
        {/* Title - Arabic */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-black)]">
            احجز رحلتك الآن
          </h2>
          <p className="text-[var(--color-grey)] mt-3">
            اختر القارب والوقت المناسب وسنؤكد حجزك مباشرة
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* LEFT: FORM - Arabic */}
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8 shadow-md">
            <form onSubmit={handleSubmit} className="grid gap-5">
              {/* Name - Arabic */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="أدخل اسمك الكامل"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition"
                  required
                />
              </div>

              {/* Phone - Arabic */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="مثال: 0550123456"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition"
                  dir="ltr"
                  required
                />
              </div>

              {/* Email - Arabic */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition"
                  dir="ltr"
                />
              </div>

              {/* Boat Selection - Arabic */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  اختر القارب *
                </label>
                <select
                  value={selectedBoatId}
                  onChange={(e) => setSelectedBoatId(e.target.value)}
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition bg-white"
                  required
                >
                  <option value="">اختر القارب</option>
                  {boats.map((boat) => (
                    <option key={boat._id} value={boat._id}>
                      {boat.title} - {getPlaceArabic(boat.place)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of People - Arabic */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  عدد الأشخاص *
                </label>
                <input
                  type="number"
                  name="numberOfPeople"
                  value={formData.numberOfPeople}
                  onChange={handleInputChange}
                  min="1"
                  max={selectedBoat?.capacity || 1}
                  placeholder={`الحد الأقصى: ${
                    selectedBoat?.capacity || "-"
                  } أشخاص`}
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition"
                  required
                />
                {selectedBoat && (
                  <p className="text-xs text-grey mt-1">
                    السعة القصوى: {selectedBoat.capacity} أشخاص
                  </p>
                )}
              </div>

              {/* Date - Arabic */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  تاريخ الرحلة *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition"
                  required
                />
              </div>

              {/* Duration - Arabic */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  مدة الرحلة *
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition bg-white"
                  required
                >
                  <option value={1}>ساعة واحدة</option>
                  <option value={2}>ساعتين</option>
                  <option value={3}>3 ساعات</option>
                  <option value={4}>4 ساعات</option>
                </select>
              </div>

              {/* Time Slots with visual indicators - Arabic labels */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  وقت الرحلة *
                </label>

                {!selectedDate || !selectedBoatId ? (
                  <p className="text-sm text-grey py-2">
                    {!selectedDate ? "اختر التاريخ أولاً" : "اختر القارب أولاً"}
                  </p>
                ) : ordersLoading ? (
                  <p className="text-sm text-grey py-2">
                    جاري تحميل المواعيد...
                  </p>
                ) : (
                  <>
                    {/* Time slots grid */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {ALL_TIME_SLOTS.map((slot) => {
                        const status = getSlotStatus(slot);
                        const isSelected = selectedTimeSlot === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={status === "taken"}
                            onClick={() => {
                              if (status === "available") {
                                setSelectedTimeSlot(slot);
                              }
                            }}
                            className={`
                              py-2 px-1 rounded-lg text-sm font-medium transition-all
                              ${
                                status === "taken"
                                  ? "bg-red-100 text-red-400 cursor-not-allowed line-through"
                                  : status === "available"
                                  ? isSelected
                                    ? "bg-[var(--color-gold)] text-[var(--color-black)] shadow-md"
                                    : "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer"
                                  : "bg-yellow-50 text-yellow-600 cursor-not-allowed opacity-60"
                              }
                            `}
                          >
                            {getSlotLabel(slot)}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend - Arabic */}
                    <div className="flex flex-wrap gap-4 text-xs mb-3">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-100 rounded"></div>
                        <span className="text-grey">
                          متاح لـ {duration} ساعة
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                        <span className="text-grey">متاح لمدة أخرى</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-100 rounded"></div>
                        <span className="text-grey">محجوز</span>
                      </div>
                    </div>
                  </>
                )}

                {/* No available slots message - Arabic */}
                {selectedDate &&
                  selectedBoatId &&
                  !ordersLoading &&
                  validSlotsForDuration.length === 0 && (
                    <p className="text-red-500 text-xs mt-1">
                      لا توجد مواعيد متاحة لـ {duration} ساعة في هذا التاريخ.
                      جرب مدة أخرى أو تاريخ آخر.
                    </p>
                  )}
              </div>

              {/* Special Requests - Arabic */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="أي طلبات خاصة أو ملاحظات..."
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition resize-none"
                />
              </div>

              {/* Price Display - Arabic */}
              {selectedBoat && calculatedPrice > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[var(--color-black)]">
                      السعر الإجمالي:
                    </span>
                    <span className="text-xl font-bold text-[var(--color-blue)]">
                      {calculatedPrice.toLocaleString()} دج
                    </span>
                  </div>
                  <p className="text-xs text-grey mt-1">
                    {getDurationLabel(duration)} - {selectedBoat.title}
                  </p>
                </div>
              )}

              {/* Submit - Arabic */}
              <button
                type="submit"
                disabled={isSubmitting || boatsLoading}
                className="bg-[var(--color-gold)] text-[var(--color-black)] py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? "جاري إرسال الطلب..." : "تأكيد الحجز"}
              </button>
            </form>
          </div>

          {/* RIGHT: BOAT PREVIEW */}
          <div className="flex flex-col justify-center items-center text-center">
            {selectedBoat ? (
              <>
                <div className="w-full max-w-md h-[300px] rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={selectedBoat.image}
                    alt={selectedBoat.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Boat title in French */}
                <h3
                  className="mt-5 text-2xl font-bold text-[var(--color-black)]"
                  dir="ltr"
                >
                  {selectedBoat.title}
                </h3>

                {/* Place in Arabic */}
                <p className="text-[var(--color-grey)] mt-1 flex items-center gap-1">
                  📍 {getPlaceArabic(selectedBoat.place)}
                </p>

                {/* Capacity in Arabic */}
                <p className="text-[var(--color-grey)] mt-2">
                  👥 السعة: {selectedBoat.capacity} أشخاص
                </p>

                {/* Description in French */}
                <p
                  className="text-[var(--color-grey)] mt-1 text-sm line-clamp-3 max-w-md"
                  dir="ltr"
                >
                  {selectedBoat.description}
                </p>

                {/* Price Info - French labels, Arabic title */}
                <div className="mt-4 p-4 bg-gray-50 rounded-xl w-full max-w-md">
                  <h4 className="font-bold text-[var(--color-black)] mb-2">
                    الأسعار:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>1h: {selectedBoat.price1h?.toLocaleString()} دج</span>
                    <span>2h: {selectedBoat.price2h?.toLocaleString()} دج</span>
                    <span>3h: {selectedBoat.price3h?.toLocaleString()} دج</span>
                    <span>4h: {selectedBoat.price4h?.toLocaleString()} دج</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-grey">
                <p>اختر قارباً لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
