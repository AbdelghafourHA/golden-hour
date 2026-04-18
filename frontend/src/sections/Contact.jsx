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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white"
      dir="rtl"
    >
      <div className="container px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-start">
          {/* RIGHT SIDE - Contact Information */}
          <div className="space-y-6 sm:space-y-8">
            {/* Logo */}
            <div className="flex justify-center md:justify-start">
              <img
                src={logo}
                alt="logo"
                className="w-40 sm:w-48 lg:w-56 xl:w-64 object-contain invert-70"
              />
            </div>

            {/* Title */}
            <div className="text-right">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-black)]">
                تواصل معنا
              </h2>
              <p className="text-[var(--color-grey)] mt-2 text-sm sm:text-base">
                نحن هنا للإجابة على جميع استفساراتك ومساعدتك في حجز رحلتك
                البحرية
              </p>
            </div>

            {/* Location Cards */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg sm:text-xl font-bold text-[var(--color-blue)] mb-3 sm:mb-4 flex items-center gap-2">
                <span>مواقعنا</span>
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-[var(--color-gold)]"
                />
              </h3>

              <div className="space-y-2 sm:space-y-3">
                {locations.map((loc, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-[var(--color-grey)] hover:text-[var(--color-black)] transition-colors text-sm sm:text-base"
                  >
                    <FontAwesomeIcon
                      icon={loc.icon}
                      className="text-[var(--color-gold)] w-4 sm:w-5"
                    />
                    <span className="font-medium">{loc.name}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  <span className="text-xs sm:text-sm text-[var(--color-grey)] sm:ml-auto order-3 sm:order-1 w-full sm:w-auto mt-1 sm:mt-0">
                    المقر الإداري
                  </span>
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className="text-[var(--color-gold)] w-4 sm:w-5 order-2"
                  />
                  <span className="font-medium text-sm sm:text-base order-1 sm:order-3">
                    AADL 1700 الحديقة
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3 sm:space-y-4 text-right">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faMapPin}
                  className="text-[var(--color-gold)] text-lg sm:text-xl w-5 sm:w-6"
                />
                <span className="text-base sm:text-lg font-medium text-[var(--color-black)]">
                  ولاية تيبازة، الجزائر
                </span>
              </div>

              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-[var(--color-gold)] text-base sm:text-lg w-5 sm:w-6"
                />
                <span className="text-[var(--color-grey)] text-sm sm:text-base">
                  يومياً: 09:00 - 20:00
                </span>
              </div>

              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-[var(--color-gold)] text-base sm:text-lg w-5 sm:w-6"
                />
                <a
                  href="tel:+213661348707"
                  className="text-[var(--color-grey)] hover:text-[var(--color-blue)] transition-colors text-sm sm:text-base"
                >
                  0661348707
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-5 sm:gap-6 text-xl sm:text-2xl justify-center md:justify-start">
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
            </div>
          </div>

          {/* LEFT SIDE - Map */}
          <div className="w-full">
            <div className="relative">
              <div className="w-full h-[350px] sm:h-[400px] lg:h-[450px] xl:h-[500px] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <iframe
                  title="موقعنا في تيبازة"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3209.498773850989!2d2.466369!3d36.586667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDM1JzEyLjAiTiAywrAyNyc1OS4zIkU!5e0!3m2!1sen!2sdz!4v1620000000000!5m2!1sen!2sdz"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <a
                href="https://maps.app.goo.gl/PEz98EM7n9zSQnbz6?g_st=ac"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm font-medium text-[var(--color-blue)] hover:bg-[var(--color-blue)] hover:text-white transition-all duration-300 flex items-center gap-1.5 sm:gap-2"
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} size="sm" />
                <span>فتح في خرائط Google</span>
              </a>
            </div>

            <p className="text-center text-xs sm:text-sm text-[var(--color-grey)] mt-2 sm:mt-3">
              اضغط على الخريطة للتنقل أو استخدم زر الفتح للحصول على الاتجاهات
            </p>
          </div>
        </div>

        {/* Bottom Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 sm:mt-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent"
        />
      </div>
    </motion.section>
  );
}
