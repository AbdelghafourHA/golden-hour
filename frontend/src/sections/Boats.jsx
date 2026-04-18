import { motion } from "framer-motion";
import { useEffect } from "react";
import useBoatsStore from "../stores/boats.store";

export default function Boats() {
  const { boats, loading, fetchBoats } = useBoatsStore();

  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  // Loading skeleton
  if (loading && boats.length === 0) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-black)]">
              القوارب المتوفرة
            </h2>
            <p className="text-[var(--color-grey)] mt-2 sm:mt-3 text-sm sm:text-base">
              اختر التجربة التي تناسبك واستمتع برحلة بحرية فريدة
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl h-[300px] sm:h-[340px] bg-gray-200 animate-pulse"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 p-4 sm:p-5 w-full">
                  <div className="h-5 sm:h-6 w-3/4 bg-gray-300 rounded mb-2" />
                  <div className="h-3 sm:h-4 w-full bg-gray-300 rounded mb-1" />
                  <div className="h-3 sm:h-4 w-2/3 bg-gray-300 rounded mb-3" />
                  <div className="flex justify-between">
                    <div className="h-3 sm:h-4 w-1/3 bg-gray-300 rounded" />
                    <div className="h-3 sm:h-4 w-1/3 bg-gray-300 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!loading && boats.length === 0) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-black)]">
              القوارب المتوفرة
            </h2>
            <p className="text-[var(--color-grey)] mt-2 sm:mt-3 text-sm sm:text-base">
              لا توجد قوارب متاحة حالياً
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      id="Boats"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="py-12 sm:py-16 md:py-20 bg-gray-50"
      dir="rtl"
    >
      <div className="container px-4 sm:px-6">
        {/* Title */}
        <div className="text-center mb-8 sm:mb-12 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-black)]">
            القوارب المتوفرة
          </h2>
          <p className="text-[var(--color-grey)] mt-2 sm:mt-3 text-sm sm:text-base">
            اختر التجربة التي تناسبك واستمتع برحلة بحرية فريدة
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boats.map((boat, index) => (
            <motion.div
              key={boat._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-2xl h-[300px] sm:h-[340px] cursor-pointer"
              onClick={() => {
                document
                  .getElementById("Booking")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <img
                src={boat.image}
                alt={boat.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x340?text=Boat";
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 p-4 sm:p-5 w-full text-left">
                <h3 className="text-white text-base sm:text-lg font-bold">
                  {boat.title}
                </h3>

                <p className="text-gray-200 text-xs sm:text-sm mt-1 sm:mt-2 leading-relaxed line-clamp-2">
                  {boat.description}
                </p>

                <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-300 font-medium flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span>📍</span>
                    {boat.place}
                  </span>
                  <span dir="ltr">{boat.price1h?.toLocaleString()} DA/H</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
