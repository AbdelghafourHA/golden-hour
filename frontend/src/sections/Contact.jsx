import { motion } from "framer-motion";
import logo from "../assets/logo01.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import {
  faLocationDot,
  faClock,
  faPhone,
  faShip,
  faBuilding,
  faMapPin,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";

export default function Contact() {
  const locations = [
    { name: "ميناء تيبازة", icon: faShip },
    { name: "ميناء شرشال", icon: faShip },
    { name: "القرن الذهبي", icon: faMapPin },
  ];

  return (
    <motion.section
      id="Contact"
      initial={{ opacity: 0, y: -60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="py-20 bg-gradient-to-b from-gray-50 to-white"
      dir="rtl" // FIX: Set RTL direction for the entire section
    >
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* RIGHT SIDE - Contact Information (in RTL) */}
          <div className="space-y-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex justify-center md:justify-start"
            >
              <img
                src={logo}
                alt="logo"
                className="w-48 lg:w-64 object-contain invert-70"
              />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-right"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-black)]">
                تواصل معنا
              </h2>
              <p className="text-[var(--color-grey)] mt-2 text-lg">
                نحن هنا للإجابة على جميع استفساراتك ومساعدتك في حجز رحلتك
                البحرية
              </p>
            </motion.div>

            {/* Location Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold text-[var(--color-blue)] mb-4 flex items-center gap-2">
                <span>مواقعنا</span>
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-[var(--color-gold)]"
                />
              </h3>

              {/* FIX: Proper RTL layout - icon on right, text on left */}
              <div className="space-y-3">
                {locations.map((loc, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-[var(--color-grey)] hover:text-[var(--color-black)] transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={loc.icon}
                      className="text-[var(--color-gold)] w-5"
                    />
                    <span className="font-medium">{loc.name}</span>
                  </div>
                ))}
              </div>

              {/* FIX: Administrative Office - proper RTL */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--color-grey)] ml-auto">
                    المقر الإداري
                  </span>
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className="text-[var(--color-gold)] w-5"
                  />
                  <span className="font-medium">AADL 1700 الحديقة</span>
                </div>
              </div>
            </motion.div>

            {/* Contact Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="space-y-4 text-right"
            >
              {/* Region */}
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faMapPin}
                  className="text-[var(--color-gold)] text-xl w-6"
                />
                <span className="text-lg font-medium text-[var(--color-black)]">
                  ولاية تيبازة، الجزائر
                </span>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-[var(--color-gold)] text-lg w-6"
                />
                <span className="text-[var(--color-grey)]">
                  يومياً: 09:00 - 20:00
                </span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-[var(--color-gold)] text-lg w-6"
                />
                <a
                  href="tel:+213661348707"
                  className="text-[var(--color-grey)] hover:text-[var(--color-blue)] transition-colors"
                >
                  0661348707
                </a>
              </div>
            </motion.div>

            {/* Social Media */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex gap-6 text-2xl justify-center md:justify-start"
            >
              <a
                href="#"
                className="text-[var(--color-grey)] hover:text-[var(--color-blue)] transition-all transform hover:scale-110"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a
                href="#"
                className="text-[var(--color-grey)] hover:text-[var(--color-pink)] transition-all transform hover:scale-110"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a
                href="#"
                className="text-[var(--color-grey)] hover:text-[var(--color-green)] transition-all transform hover:scale-110"
                aria-label="WhatsApp"
              >
                <FontAwesomeIcon icon={faWhatsapp} />
              </a>
            </motion.div>
          </div>

          {/* LEFT SIDE - Map (in RTL) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <div className="relative">
              {/* Map Container */}
              <div className="w-full h-[450px] lg:h-[500px] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <iframe
                  title="موقعنا في تيبازة"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3209.498773850989!2d2.466369!3d36.586667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDM1JzEyLjAiTiAywrAyNyc1OS4zIkU!5e0!3m2!1sen!2sdz!4v1620000000000!5m2!1sen!2sdz"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              {/* Map Overlay Button - FIX: Proper RTL positioning */}
              <a
                href="https://maps.app.goo.gl/PEz98EM7n9zSQnbz6?g_st=ac"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium text-[var(--color-blue)] hover:bg-[var(--color-blue)] hover:text-white transition-all duration-300 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} size="sm" />
                <span>فتح في خرائط Google</span>
              </a>
            </div>

            {/* Map Hint */}
            <p className="text-center text-sm text-[var(--color-grey)] mt-3">
              اضغط على الخريطة للتنقل أو استخدم زر الفتح للحصول على الاتجاهات
            </p>
          </motion.div>
        </div>

        {/* Bottom Decorative Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 h-px bg-gradient-to-r from-transparent via-blue to-transparent"
        />
      </div>
    </motion.section>
  );
}
