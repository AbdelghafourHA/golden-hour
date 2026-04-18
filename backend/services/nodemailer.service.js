import transporter from "../lib/nodemailer.js";
import {
  generateAdminNotificationEmail,
  generateCustomerConfirmationEmail,
} from "../utils/emailTemplates.js";

// Send email to admin when new order is created
export const sendAdminNotification = async (order) => {
  try {
    const { subject, html, text } = generateAdminNotificationEmail(order);

    const mailOptions = {
      from: `"Golden Hour Booking" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Admin email
      subject: subject,
      html: html,
      text: text,
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log("✅ Admin notification sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send admin notification:", error);
    return { success: false, error: error.message };
  }
};

// Send confirmation email to customer (optional)
export const sendCustomerConfirmation = async (order) => {
  try {
    if (!order.customerEmail) {
      // console.log("ℹ️ No customer email provided, skipping confirmation");
      return { success: false, reason: "No email provided" };
    }

    const { subject, html } = generateCustomerConfirmationEmail(order);

    const mailOptions = {
      from: `"Golden Hour" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log("✅ Customer confirmation sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send customer confirmation:", error);
    return { success: false, error: error.message };
  }
};

export const sendBookingNotifications = async (order) => {
  try {
    const adminResult = await sendAdminNotification(order);
    let customerResult = null;
    if (order.customerEmail) {
      customerResult = await sendCustomerConfirmation(order);
    }
    return { admin: adminResult, customer: customerResult };
  } catch (error) {
    logger.error("Email notification failed (non-blocking):", error.message);
    return { success: false, error: error.message };
  }
};
