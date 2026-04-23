import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useBoatsStore from "../stores/boats.store";
import useOrdersStore from "../stores/orders.store";

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
  const { t } = useTranslation();
  const { boats, loading: boatsLoading, fetchBoats } = useBoatsStore();
  const {
    availableSlots,
    loading: ordersLoading,
    getAvailableSlots,
    createOrder,
  } = useOrdersStore();

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

  const takenSlots = useMemo(() => {
    return ALL_TIME_SLOTS.filter((slot) => !availableSlots.includes(slot));
  }, [availableSlots]);

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

  const validSlotsForDuration = useMemo(() => {
    return availableSlots.filter((slot) =>
      isSlotValidForDuration(slot, duration)
    );
  }, [availableSlots, duration]);

  const getSlotStatus = (slot) => {
    if (takenSlots.includes(slot)) return "taken";
    if (validSlotsForDuration.includes(slot)) return "available";
    return "available-other-duration";
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
      toast.error(t("booking.errors.selectBoat"));
      return;
    }
    if (!selectedDate) {
      toast.error(t("booking.errors.selectDate"));
      return;
    }
    if (!selectedTimeSlot) {
      toast.error(t("booking.errors.selectTime"));
      return;
    }
    if (!formData.customerName.trim()) {
      toast.error(t("booking.errors.enterName"));
      return;
    }
    if (!formData.customerPhone.trim()) {
      toast.error(t("booking.errors.enterPhone"));
      return;
    }
    if (!formData.numberOfPeople || formData.numberOfPeople < 1) {
      toast.error(t("booking.errors.enterPeople"));
      return;
    }
    if (formData.numberOfPeople > selectedBoat?.capacity) {
      toast.error(
        t("booking.errors.maxCapacity", { capacity: selectedBoat.capacity })
      );
      return;
    }

    if (
      !selectedBoat?.price1h ||
      !selectedBoat?.price2h ||
      !selectedBoat?.price3h ||
      !selectedBoat?.price4h
    ) {
      toast.error(t("booking.errors.incompletePrice"));
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
      toast.success(t("booking.success"));
    }
  };

  const getDurationLabel = (dur) => {
    if (dur === 1) return t("booking.oneHour");
    if (dur === 2) return t("booking.twoHours");
    if (dur === 3) return t("booking.threeHours");
    if (dur === 4) return t("booking.fourHours");
    return `${dur} ${t("booking.hours")}`;
  };

  const getPlaceArabic = (place) => {
    const placeMap = {
      "ميناء تيبازة": "ميناء تيبازة",
      "ميناء شرشال": "ميناء شرشال",
      "القرن الذهبي": "القرن الذهبي",
    };
    return placeMap[place] || place;
  };

  const getBonusFromDuration = (dur) => {
    if (dur === 1) return t("booking.bonus1h");
    if (dur === 2) return t("booking.bonus2h");
    if (dur === 3) return t("booking.bonus3h");
    if (dur === 4) return t("booking.bonus4h");
    return "";
  };

  if (boatsLoading && boats.length === 0) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container px-4 sm:px-6 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 sm:w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64 sm:w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      id="Booking"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="py-12 sm:py-16 md:py-20 bg-white"
      // dir="rtl"
    >
      <div className="container px-4 sm:px-6">
        {/* Title */}
        <div className="text-center mb-8 sm:mb-12 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-black)]">
            {t("booking.title")}
          </h2>
          <p className="text-[var(--color-grey)] mt-2 sm:mt-3 text-sm sm:text-base">
            {t("booking.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {/* LEFT: FORM */}
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 md:p-8 shadow-md">
            <form onSubmit={handleSubmit} className="grid gap-4 sm:gap-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  {t("booking.fullName")} *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder={t("booking.fullNamePlaceholder")}
                  className="w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  {t("booking.phone")} *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder={t("booking.phonePlaceholder")}
                  className="w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition"
                  dir="ltr"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  {t("booking.email")}
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  placeholder={t("booking.emailPlaceholder")}
                  className="w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition"
                  dir="ltr"
                />
              </div>

              {/* Boat Selection */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  {t("booking.selectBoat")} *
                </label>
                <select
                  value={selectedBoatId}
                  onChange={(e) => setSelectedBoatId(e.target.value)}
                  className="w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition bg-white"
                  required
                >
                  <option value="">{t("booking.selectBoatPlaceholder")}</option>
                  {boats.map((boat) => (
                    <option key={boat._id} value={boat._id}>
                      {boat.title} - {getPlaceArabic(boat.place)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of People */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  {t("booking.people")} *
                </label>
                <input
                  type="number"
                  name="numberOfPeople"
                  value={formData.numberOfPeople}
                  onChange={handleInputChange}
                  min="1"
                  max={selectedBoat?.capacity || 1}
                  placeholder={`${t("booking.maxCapacity")}: ${
                    selectedBoat?.capacity || "-"
                  } ${t("booking.persons")}`}
                  className="w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition"
                  required
                />
                {selectedBoat && (
                  <p className="text-xs text-grey mt-1">
                    {t("booking.maxCapacity")}: {selectedBoat.capacity}{" "}
                    {t("booking.persons")}
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  {t("booking.date")} *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  className="w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  {t("booking.duration")} *
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition bg-white"
                  required
                >
                  <option value={1}>{t("booking.oneHour")}</option>
                  <option value={2}>{t("booking.twoHours")}</option>
                  <option value={3}>{t("booking.threeHours")}</option>
                  <option value={4}>{t("booking.fourHours")}</option>
                </select>
                <p className="text-sm  text-grey mt-1">
                  {getBonusFromDuration(duration)}
                </p>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  {t("booking.time")} *
                </label>

                {!selectedDate || !selectedBoatId ? (
                  <p className="text-sm text-grey py-2">
                    {!selectedDate
                      ? t("booking.selectDate")
                      : t("booking.selectBoatFirst")}
                  </p>
                ) : ordersLoading ? (
                  <p className="text-sm text-grey py-2">
                    {t("booking.loadingSlots")}
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-3">
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
                              py-1.5 sm:py-2 px-1 rounded-lg text-xs sm:text-sm font-medium transition-all
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
                            {slot}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs mb-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-100 rounded"></div>
                        <span className="text-grey">
                          {t("booking.available")} {duration}{" "}
                          {t("booking.hour")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-50 rounded"></div>
                        <span className="text-grey">
                          {t("booking.otherDuration")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-100 rounded"></div>
                        <span className="text-grey">{t("booking.taken")}</span>
                      </div>
                    </div>
                  </>
                )}

                {selectedDate &&
                  selectedBoatId &&
                  !ordersLoading &&
                  validSlotsForDuration.length === 0 && (
                    <p className="text-red-500 text-xs mt-1">
                      {t("booking.noSlotsAvailable", { duration })}
                    </p>
                  )}
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  {t("booking.notes")}
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder={t("booking.notesPlaceholder")}
                  className="w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition resize-none"
                />
              </div>

              {/* Price Display */}
              {selectedBoat && calculatedPrice > 0 && (
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[var(--color-black)] text-sm sm:text-base">
                      {t("booking.totalPrice")}:
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-[var(--color-blue)]">
                      {calculatedPrice.toLocaleString()} {t("booking.da")}
                    </span>
                  </div>
                  <p className="text-xs text-grey mt-1">
                    {getDurationLabel(duration)} - {selectedBoat.title}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || boatsLoading}
                className="bg-[var(--color-gold)] text-[var(--color-black)] py-2.5 sm:py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-sm sm:text-base"
              >
                {isSubmitting ? t("booking.sending") : t("booking.confirm")}
              </button>
            </form>
          </div>

          {/* RIGHT: BOAT PREVIEW */}
          <div className="flex flex-col justify-center items-center text-center">
            {selectedBoat ? (
              <>
                <div className="w-full max-w-md h-[250px] sm:h-[300px] rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={selectedBoat.image}
                    alt={selectedBoat.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3
                  className="mt-4 sm:mt-5 text-xl sm:text-2xl font-bold text-[var(--color-black)]"
                  dir="ltr"
                >
                  {selectedBoat.title}
                </h3>

                <p className="text-[var(--color-grey)] mt-1 flex items-center gap-1 text-sm sm:text-base">
                  📍 {getPlaceArabic(selectedBoat.place)}
                </p>

                <p className="text-[var(--color-grey)] mt-1 sm:mt-2 text-sm sm:text-base">
                  👥 {t("booking.capacity")}: {selectedBoat.capacity}{" "}
                  {t("booking.persons")}
                </p>

                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-xl w-full max-w-md">
                  <h4 className="font-bold text-[var(--color-black)] mb-2 text-sm sm:text-base">
                    {t("booking.prices")}:
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <span>
                      1h: {selectedBoat.price1h?.toLocaleString()}{" "}
                      {t("booking.da")}
                    </span>
                    <span>
                      2h: {selectedBoat.price2h?.toLocaleString()}{" "}
                      {t("booking.da")}
                    </span>
                    <span>
                      3h: {selectedBoat.price3h?.toLocaleString()}{" "}
                      {t("booking.da")}
                    </span>
                    <span>
                      4h: {selectedBoat.price4h?.toLocaleString()}{" "}
                      {t("booking.da")}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-grey py-8 sm:py-12">
                <p className="text-sm sm:text-base">
                  {t("booking.selectBoatMessage")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
