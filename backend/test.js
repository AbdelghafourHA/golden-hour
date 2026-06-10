import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "http://localhost:5000";

export const options = {
  vus: 2,
  iterations: 10,
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.01"],
  },
};

const testCustomers = [
  { name: "أحمد محمد", phone: "0555123451", email: "ahmed1@test.com" },
  { name: "سارة علي", phone: "0555123452", email: "sara2@test.com" },
  { name: "محمد خالد", phone: "0555123453", email: "mohamed3@test.com" },
  { name: "فاطمة حسن", phone: "0555123454", email: "fatima4@test.com" },
  { name: "عبد الله رشيد", phone: "0555123455", email: "abdallah5@test.com" },
  { name: "نورا كمال", phone: "0555123456", email: "nora6@test.com" },
  { name: "يوسف طارق", phone: "0555123457", email: "youssef7@test.com" },
  { name: "ليلى عماد", phone: "0555123458", email: "laila8@test.com" },
  { name: "عمر سمير", phone: "0555123459", email: "omar9@test.com" },
  { name: "هدى ربيع", phone: "0555123460", email: "houda10@test.com" },
];

// تخزين التواريخ والأوقات المستخدمة لمنع التضارب بين الطلبات
const usedSlots = new Set();

const getBookingDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
};

export default function () {
  const vuId = __VU;
  const iterId = __ITER;

  // 1. جلب القوارب
  const boatsResponse = http.get(`${BASE_URL}/api/boats`);

  let boatId = null;

  check(boatsResponse, {
    "GET /api/boats - status 200": (r) => r.status === 200,
  });

  if (boatsResponse.status === 200) {
    try {
      const boats = JSON.parse(boatsResponse.body);
      if (boats.length > 0) {
        boatId = boats[0]._id;
        console.log(`✅ Boat: ${boats[0].title}`);
      } else {
        console.error("❌ No boats found");
        return;
      }
    } catch (e) {
      console.error("❌ Parse error");
      return;
    }
  }

  sleep(0.3);

  // 2. جلب المواعيد المتاحة (تاريخ فريد لكل طلب)
  // نستخدم تاريخ مختلف لكل طلب لتجنب التضارب
  const bookingDate = getBookingDate(iterId + 1);

  const slotsResponse = http.get(
    `${BASE_URL}/api/available-slots?boatId=${boatId}&date=${bookingDate}`
  );

  let availableSlots = [];

  if (slotsResponse.status === 200) {
    try {
      const slotsData = JSON.parse(slotsResponse.body);
      availableSlots = slotsData.availableSlots || [];
      console.log(
        `📅 ${bookingDate} - Available: ${availableSlots.length} slots`
      );
    } catch (e) {
      console.error("Slots parse error");
    }
  }

  // إذا لم تكن هناك مواعيد متاحة، نجرب تاريخ آخر
  if (availableSlots.length === 0) {
    console.log("⚠️ No available slots, trying another date...");
    const altDate = getBookingDate(iterId + 10);
    const altResponse = http.get(
      `${BASE_URL}/api/available-slots?boatId=${boatId}&date=${altDate}`
    );
    if (altResponse.status === 200) {
      try {
        const altData = JSON.parse(altResponse.body);
        availableSlots = altData.availableSlots || [];
      } catch (e) {}
    }
  }

  // إذا كان لا يزال لا توجد مواعيد، نخرج من الاختبار لهذا التكرار
  if (availableSlots.length === 0) {
    console.log("❌ No available slots found, skipping...");
    return;
  }

  // اختيار أول وقت متاح (نضمن أنه غير محجوز)
  const selectedStartTime = availableSlots[0];
  const selectedDuration = 1; // مدة ساعة واحدة لتقليل التضارب

  const customer = testCustomers[iterId % testCustomers.length];

  // 3. إنشاء الحجز
  const payload = JSON.stringify({
    boatId: boatId,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    bookingDate: bookingDate,
    startTime: selectedStartTime,
    duration: selectedDuration,
    numberOfPeople: 4,
    specialRequests: `Test booking ${iterId + 1}`,
  });

  const orderResponse = http.post(`${BASE_URL}/api/orders`, payload, {
    headers: { "Content-Type": "application/json" },
  });

  const success = check(orderResponse, {
    "✅ POST /api/orders - status 201": (r) => r.status === 201,
    "✅ POST /api/orders - success true": (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true;
      } catch {
        return false;
      }
    },
  });

  if (orderResponse.status === 201) {
    try {
      const body = JSON.parse(orderResponse.body);
      console.log(`✅ Order ${iterId + 1} created! ID: ${body.order?._id}`);
    } catch (e) {
      console.log(`✅ Order ${iterId + 1} created!`);
    }
  } else {
    console.log(`❌ Order ${iterId + 1} failed: ${orderResponse.status}`);
  }

  sleep(0.5);
}
