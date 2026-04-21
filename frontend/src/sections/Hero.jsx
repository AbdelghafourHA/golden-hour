import { motion } from "framer-motion";
import { useTranslation, Trans } from "react-i18next";
import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.jpg";
import hero3 from "../assets/hero3.jpg";
import logo from "../assets/logo01.png";

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section
      id="Hero"
      className="py-12 md:py-20 md:min-h-screen flex items-center"
    >
      <div className="container grid md:grid-cols-2 items-center mt-20 ">
        {/* TEXT + CARD */}
        <div className="">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-black)] leading-tight"
          >
            <img
              src={logo}
              alt="logo"
              className="invert-70 w-40 lg:w-60 mx-auto md:mx-0 mb-5 hidden md:block"
            />
            <Trans i18nKey="home.title" components={{ br: <br /> }} />
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
            className="mt-4 text-[var(--color-grey)] max-w-md"
          >
            {t("home.subtitle")}
          </motion.p>

          {/* CARD - unchanged */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            className="mt-8 bg-white shadow-xl rounded-xl p-5 flex items-center gap-6 lg:gap-8 w-fit"
          >
            {/* Location */}
            <div className="">
              <p className="text-sm text-gray-400">{t("home.location")}</p>
              <p className="text-sm lg:text-base font-semibold text-[var(--color-black)]">
                {t("home.locationName")}
              </p>
            </div>

            {/* Work Time */}
            <div className="">
              <p className="text-sm text-gray-400">{t("home.workHours")}</p>
              <p className="font-semibold text-sm lg:text-base text-[var(--color-black)]">
                {t("home.hours")}
              </p>
            </div>

            {/* CTA */}
            <a
              href="#Booking"
              className="text-sm md:text-base bg-gold cursor-pointer text-[var(--color-black)] px-5 py-2 rounded-full font-semibold hover:opacity-90 transition duration-300"
            >
              {t("home.cta")}
            </a>
          </motion.div>
        </div>

        {/* IMAGES - unchanged */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mt-10 md:mt-0 flex justify-center lg:justify-start"
        >
          <div className="relative flex items-center gap-4 ">
            {/* LEFT SIDE */}
            <div className="flex flex-col gap-4 z-10 flex-1">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={hero1}
                className="rounded-xl object-cover 
         shadow-lg max-h-50"
              />

              <motion.img
                whileHover={{ scale: 1.05 }}
                src={hero3}
                className="rounded-xl object-cover 
        shadow-lg max-h-60 min-h-50"
              />
            </div>

            {/* RIGHT SIDE */}
            <div className="relative flex items-center z-20 flex-1">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={hero2}
                className="rounded-xl object-cover 
        shadow-xl max-h-70 min-h-60"
              />

              {/* TOP FLOAT ICON */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-16 left-8 text-[var(--color-gold)] text-2xl md:text-4xl"
              >
                🚤
              </motion.div>

              {/* BOTTOM FLOAT ICON */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-16 right-8 text-[var(--color-gold)] text-2xl md:text-4xl"
              >
                ➤
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
