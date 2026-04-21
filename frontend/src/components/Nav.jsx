import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo02.png";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("الرئيسية");
  const { t } = useTranslation();

  const links = [
    { name: t("nav.home", "الرئيسية"), href: "#Hero" },
    { name: t("nav.boats", "القوارب"), href: "#Boats" },
    { name: t("nav.contact", "التواصل"), href: "#Contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed w-full top-0 z-50 backdrop-blur-sm bg-blue/90 text-white shadow-md"
    >
      <div className="container py-4 flex items-center justify-between">
        {/* Left side - Desktop Links + Language Switcher */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <ul className="flex items-center gap-6 lg:gap-8 font-medium">
            {links.map((link) => (
              <li key={link.name} className="relative">
                <a
                  href={link.href}
                  onClick={() => setActive(link.name)}
                  className={`transition-colors duration-300 ${
                    active === link.name ? "text-gold" : "hover:text-gold"
                  }`}
                >
                  {link.name}
                </a>

                {active === link.name && (
                  <motion.div
                    layoutId="underline"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute left-0 -bottom-1 w-full h-[2px] bg-gold"
                  />
                )}
              </li>
            ))}
          </ul>

          {/* Language Switcher - beside links */}
          <LanguageSwitcher />
        </div>

        {/* Empty div for spacing on desktop */}
        <div className="hidden md:block w-20"></div>

        {/* Logo - Centered */}
        <div className="absolute p-2 rounded-full left-1/2 transform -translate-x-1/2 top-2 z-2">
          <img src={logo} alt="logo" className="h-19 lg:h-23 object-contain" />
        </div>

        <div
          className={`w-16 h-8 lg:w-20 lg:h-11 bg-blue/90 backdrop-blur-sm absolute left-1/2 transform -translate-x-1/2 top-17 md:top-18 z-0 rounded-bl-full rounded-br-full transition duration-300 ${
            !open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Right side - CTA */}
        <div className="order-1 md:order-2">
          <a
            href="#Booking"
            className="bg-gold flex cursor-pointer text-black px-4 py-2 rounded-full font-semibold hover:opacity-90 transition duration-300 text-sm md:text-base"
          >
            {t("nav.booking", "احجز الآن")}
          </a>
        </div>

        {/* Mobile - Language Switcher + Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={() => setOpen(!open)} className="text-2xl">
            ☰
          </button>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden px-6 py-4 z-1"
          >
            <ul className="flex flex-col gap-4 font-medium z-1">
              {links.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={() => {
                      setActive(link.name);
                      setOpen(false);
                    }}
                    className={`block w-full transition duration-200 ${
                      active === link.name ? "text-gold" : ""
                    }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
