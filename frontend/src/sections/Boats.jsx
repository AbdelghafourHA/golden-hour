import { motion } from "framer-motion";
import { useEffect } from "react";
import useBoatsStore from "../stores/boats.store";

// FIX: Removed static image imports - now using Cloudinary URLs from backend

export default function Boats() {
  // FIX: Use boats store instead of static data
  const { boats, loading, fetchBoats } = useBoatsStore();

  // FIX: Fetch boats from API on component mount
  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  // FIX: Loading skeleton for better UX
  if (loading && boats.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-black)]">
              القوارب المتوفرة
            </h2>
            <p className="text-[var(--color-grey)] mt-3">
              اختر التجربة التي تناسبك واستمتع برحلة بحرية فريدة
            </p>
          </div>

          {/* FIX: Skeleton loader grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl h-[340px] bg-gray-200 animate-pulse"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 p-5 w-full">
                  <div className="h-6 w-3/4 bg-gray-300 rounded mb-2" />
                  <div className="h-4 w-full bg-gray-300 rounded mb-1" />
                  <div className="h-4 w-2/3 bg-gray-300 rounded mb-3" />
                  <div className="h-4 w-1/2 bg-gray-300 rounded mb-1" />
                  <div className="h-4 w-1/2 bg-gray-300 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // FIX: Handle empty state gracefully
  if (!loading && boats.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-black)]">
              القوارب المتوفرة
            </h2>
            <p className="text-[var(--color-grey)] mt-3">
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
      initial={{ opacity: 0, y: -60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="py-20 bg-gray-50"
    >
      <div className="container">
        {/* Title */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-black)]">
            القوارب المتوفرة
          </h2>
          <p className="text-[var(--color-grey)] mt-3">
            اختر التجربة التي تناسبك واستمتع برحلة بحرية فريدة
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {boats.map((boat) => (
            <div
              key={boat._id} // FIX: Use MongoDB _id instead of static id
              dir="ltr"
              className="group relative overflow-hidden rounded-2xl h-[340px]"
            >
              {/* FIX: Use Cloudinary image URL from backend */}
              <img
                src={boat.image}
                alt={boat.title} // FIX: Use title from backend
                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                loading="lazy" // FIX: Lazy load images for better performance
                onError={(e) => {
                  // FIX: Fallback for broken images
                  e.target.src =
                    "https://via.placeholder.com/400x340?text=Boat";
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 p-5 text-left w-full">
                {/* Name - FIX: Use title from backend */}
                <h3 className="text-white text-lg font-bold">{boat.title}</h3>

                {/* Description - FIX: Use description from backend */}
                <p className="text-sm text-gray-200 mt-2 leading-relaxed line-clamp-2">
                  {boat.description}
                </p>

                {/* Prices - FIX: Format prices from backend */}
                <div className="mt-3 text-sm text-gray-300 font-bold flex justify-between">
                  <p>{boat.price1h?.toLocaleString()} DA/H</p>
                  <p>{boat.place}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
