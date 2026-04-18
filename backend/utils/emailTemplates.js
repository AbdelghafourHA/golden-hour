// Generate Arabic email for new booking notification (to Admin)
export const generateAdminNotificationEmail = (order) => {
  const formattedDate = new Date(order.bookingDate).toLocaleDateString(
    "ar-DZ",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const statusArabic = {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    cancelled: "ملغي",
    completed: "مكتمل",
  };

  return {
    subject: `🚤 حجز جديد - ${order.boatName} - ${formattedDate}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Arial', 'Tahoma', 'Segoe UI', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
            direction: rtl;
            text-align: right;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            direction: rtl;
            text-align: right;
          }
          .header {
            background: linear-gradient(135deg, #1a237e, #0d47a1);
            color: white;
            padding: 25px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .header .badge {
            display: inline-block;
            background-color: #ffd700;
            color: #000;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 10px;
          }
          .content {
            padding: 25px;
            direction: rtl;
            text-align: right;
          }
          .greeting {
            font-size: 16px;
            color: #333;
            margin-bottom: 20px;
            text-align: right;
          }
          .section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            direction: rtl;
            text-align: right;
          }
          .section-title {
            color: #1a237e;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 12px;
            border-bottom: 2px solid #ffd700;
            padding-bottom: 8px;
            text-align: right;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
            direction: rtl;
            text-align: right;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            color: #666;
            font-weight: 500;
            text-align: right;
          }
          .info-value {
            color: #1a237e;
            font-weight: bold;
            text-align: left;
            direction: ltr;
            unicode-bidi: embed;
          }
          .info-value-arabic {
            color: #1a237e;
            font-weight: bold;
            text-align: right;
          }
          .price-box {
            background: linear-gradient(135deg, #ffd700, #ffc107);
            color: #000;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin-top: 15px;
          }
          .price-box .price {
            font-size: 28px;
            font-weight: bold;
          }
          .special-requests {
            background-color: #fff3cd;
            border-right: 4px solid #ffc107;
            padding: 12px;
            border-radius: 4px;
            margin-top: 15px;
            text-align: right;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 15px 25px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
          }
          .button {
            display: inline-block;
            background-color: #1a237e;
            color: white;
            padding: 12px 30px;
            border-radius: 25px;
            text-decoration: none;
            margin-top: 15px;
            font-weight: bold;
            text-align: center;
          }
          .status-badge {
            display: inline-block;
            background-color: #ffc107;
            color: #000;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
          }
          /* Force RTL on all text */
          p, div, span, h1, h2, h3, h4, h5, h6 {
            direction: rtl;
          }
          /* LTR only for numbers, emails, and English text */
          .ltr, .phone, .email, .price, .duration {
            direction: ltr !important;
            display: inline-block;
            unicode-bidi: embed;
          }
          .rtl {
            direction: rtl !important;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛥️ Golden Hour</h1>
            <div class="badge">حجز جديد</div>
          </div>
          
          <div class="content">
            <p class="greeting">
              تم استلام حجز جديد. يرجى مراجعة التفاصيل أدناه والتواصل مع العميل للتأكيد.
            </p>
            
            <!-- Customer Info -->
            <div class="section">
              <div class="section-title">👤 معلومات العميل</div>
              <div class="info-row">
                <span class="info-label">الاسم الكامل</span>
                <span class="info-value-arabic">${order.customerName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">رقم الهاتف</span>
                <span class="info-value">
                  <span class="ltr">${order.customerPhone}</span>
                </span>
              </div>
              ${
                order.customerEmail
                  ? `
              <div class="info-row">
                <span class="info-label">البريد الإلكتروني</span>
                <span class="info-value">
                  <span class="ltr">${order.customerEmail}</span>
                </span>
              </div>
              `
                  : ""
              }
            </div>
            
            <!-- Booking Details -->
            <div class="section">
              <div class="section-title">📅 تفاصيل الحجز</div>
              <div class="info-row">
                <span class="info-label">القارب</span>
                <span class="info-value-arabic">${order.boatName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">المكان</span>
                <span class="info-value-arabic">${order.boatPlace}</span>
              </div>
              <div class="info-row">
                <span class="info-label">التاريخ</span>
                <span class="info-value-arabic">${formattedDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">الوقت</span>
                <span class="info-value">
                  <span class="ltr">${
                    order.startTime
                  }</span> - <span class="ltr">${order.endTime}</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">المدة</span>
                <span class="info-value-arabic">${order.duration} ${
      order.duration === 1 ? "ساعة" : "ساعات"
    }</span>
              </div>
              <div class="info-row">
                <span class="info-label">عدد الأشخاص</span>
                <span class="info-value-arabic">${
                  order.numberOfPeople || "غير محدد"
                }</span>
              </div>
              <div class="info-row">
                <span class="info-label">الحالة</span>
                <span class="info-value-arabic"><span class="status-badge">${
                  statusArabic[order.status]
                }</span></span>
              </div>
            </div>
            
            ${
              order.specialRequests
                ? `
            <div class="special-requests">
              <strong>📝 ملاحظات خاصة:</strong><br>
              <span class="rtl">${order.specialRequests}</span>
            </div>
            `
                : ""
            }
            
            <!-- Price -->
            <div class="price-box">
              <div style="font-size: 14px; margin-bottom: 5px;">السعر الإجمالي</div>
              <div class="price">
                <span class="ltr">${order.totalPrice?.toLocaleString()}</span> دج
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${
                process.env.FRONTEND_URL || "http://localhost:5173"
              }/hadashboard" class="button">
                الذهاب إلى لوحة التحكم
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Golden Hour - جميع الحقوق محفوظة</p>
            <p>تم إرسال هذا الإشعار تلقائياً من نظام الحجوزات</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      حجز جديد - Golden Hour
      ========================
      
      معلومات العميل:
      الاسم: ${order.customerName}
      الهاتف: ${order.customerPhone}
      ${order.customerEmail ? `البريد: ${order.customerEmail}` : ""}
      
      تفاصيل الحجز:
      القارب: ${order.boatName}
      المكان: ${order.boatPlace}
      التاريخ: ${formattedDate}
      الوقت: ${order.startTime} - ${order.endTime}
      المدة: ${order.duration} ساعة
      عدد الأشخاص: ${order.numberOfPeople || "غير محدد"}
      
      ${order.specialRequests ? `ملاحظات: ${order.specialRequests}` : ""}
      
      السعر الإجمالي: ${order.totalPrice?.toLocaleString()} دج
      
      للاطلاع على الحجز: ${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/hadashboard
    `,
  };
};

// Generate confirmation email for customer
export const generateCustomerConfirmationEmail = (order) => {
  const formattedDate = new Date(order.bookingDate).toLocaleDateString(
    "ar-DZ",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return {
    subject: `✅ تأكيد طلب الحجز - ${order.boatName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Arial', 'Tahoma', 'Segoe UI', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
            direction: rtl;
            text-align: right;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            direction: rtl;
            text-align: right;
          }
          .header {
            background: linear-gradient(135deg, #1a237e, #0d47a1);
            color: white;
            padding: 25px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .header .badge {
            display: inline-block;
            background-color: #4caf50;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 10px;
          }
          .content {
            padding: 25px;
            direction: rtl;
            text-align: right;
          }
          .greeting {
            font-size: 16px;
            color: #333;
            margin-bottom: 20px;
            text-align: right;
          }
          .section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            direction: rtl;
            text-align: right;
          }
          .section-title {
            color: #1a237e;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 12px;
            border-bottom: 2px solid #ffd700;
            padding-bottom: 8px;
            text-align: right;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
            direction: rtl;
            text-align: right;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            color: #666;
            font-weight: 500;
            text-align: right;
          }
          .info-value {
            color: #1a237e;
            font-weight: bold;
            text-align: left;
            direction: ltr;
            unicode-bidi: embed;
          }
          .info-value-arabic {
            color: #1a237e;
            font-weight: bold;
            text-align: right;
          }
          .price-box {
            background: linear-gradient(135deg, #ffd700, #ffc107);
            color: #000;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin-top: 15px;
          }
          .price-box .price {
            font-size: 28px;
            font-weight: bold;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 15px 25px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
          }
          .note {
            background-color: #e3f2fd;
            border-right: 4px solid #1a237e;
            padding: 12px;
            border-radius: 4px;
            margin-top: 15px;
            text-align: right;
          }
          /* Force RTL on all text */
          p, div, span, h1, h2, h3, h4, h5, h6 {
            direction: rtl;
          }
          /* LTR only for numbers, emails, and English text */
          .ltr, .phone, .email, .price, .duration {
            direction: ltr !important;
            display: inline-block;
            unicode-bidi: embed;
          }
          .rtl {
            direction: rtl !important;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛥️ Golden Hour</h1>
            <div class="badge">تم استلام طلبك</div>
          </div>
          
          <div class="content">
            <p class="greeting">
              مرحباً <strong>${order.customerName}</strong>،
            </p>
            
            <p class="greeting">
              نشكرك على اختيارك Golden Hour! تم استلام طلب الحجز الخاص بك بنجاح.
            </p>
            
            <p class="greeting">
              سنتواصل معك قريباً عبر الهاتف لتأكيد الحجز وإتمام عملية الدفع.
            </p>
            
            <!-- Booking Details -->
            <div class="section">
              <div class="section-title">📅 تفاصيل حجزك</div>
              <div class="info-row">
                <span class="info-label">القارب</span>
                <span class="info-value-arabic">${order.boatName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">المكان</span>
                <span class="info-value-arabic">${order.boatPlace}</span>
              </div>
              <div class="info-row">
                <span class="info-label">التاريخ</span>
                <span class="info-value-arabic">${formattedDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">الوقت</span>
                <span class="info-value">
                  <span class="ltr">${
                    order.startTime
                  }</span> - <span class="ltr">${order.endTime}</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">المدة</span>
                <span class="info-value-arabic">${order.duration} ${
      order.duration === 1 ? "ساعة" : "ساعات"
    }</span>
              </div>
              <div class="info-row">
                <span class="info-label">عدد الأشخاص</span>
                <span class="info-value-arabic">${
                  order.numberOfPeople || "غير محدد"
                }</span>
              </div>
            </div>
            
            ${
              order.specialRequests
                ? `
            <div class="note">
              <strong>📝 ملاحظاتك:</strong><br>
              <span class="rtl">${order.specialRequests}</span>
            </div>
            `
                : ""
            }
            
            <!-- Price -->
            <div class="price-box">
              <div style="font-size: 14px; margin-bottom: 5px;">السعر الإجمالي</div>
              <div class="price">
                <span class="ltr">${order.totalPrice?.toLocaleString()}</span> دج
              </div>
            </div>
            
            <div class="note">
              <strong>📞 معلومات مهمة:</strong><br>
              سنتواصل معك قريباً على الرقم 
              <span class="ltr">${order.customerPhone}</span> 
              لتأكيد الحجز. يرجى التأكد من أن هاتفك متاح.
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Golden Hour - جميع الحقوق محفوظة</p>
            <p>📍 ولاية تيبازة، الجزائر | 📞 0661348707</p>
            <p>شكراً لاختيارك Golden Hour! نتمنى لك رحلة ممتعة.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      تأكيد طلب الحجز - Golden Hour
      ================================
      
      مرحباً ${order.customerName}،
      
      نشكرك على اختيارك Golden Hour! تم استلام طلب الحجز الخاص بك بنجاح.
      سنتواصل معك قريباً عبر الهاتف لتأكيد الحجز وإتمام عملية الدفع.
      
      تفاصيل حجزك:
      القارب: ${order.boatName}
      المكان: ${order.boatPlace}
      التاريخ: ${formattedDate}
      الوقت: ${order.startTime} - ${order.endTime}
      المدة: ${order.duration} ساعة
      عدد الأشخاص: ${order.numberOfPeople || "غير محدد"}
      
      ${order.specialRequests ? `ملاحظاتك: ${order.specialRequests}` : ""}
      
      السعر الإجمالي: ${order.totalPrice?.toLocaleString()} دج
      
      سنتواصل معك قريباً على الرقم ${order.customerPhone}.
      
      شكراً لاختيارك Golden Hour! نتمنى لك رحلة ممتعة.
      
      📍 ولاية تيبازة، الجزائر | 📞 0661348707
    `,
  };
};
