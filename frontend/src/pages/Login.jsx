import { motion } from "framer-motion";
import { useState } from "react";
import logo from "../assets/logo01.png";
import useAuth from "../stores/auth.store";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const { login, loading } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form.email, form.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-blue)] px-4">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="logo" className="w-20 invert" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-[var(--color-black)]">
          تسجيل الدخول
        </h2>

        <p className="text-center text-[var(--color-grey)] mt-2 text-sm">
          لوحة التحكم - إدارة القوارب والحجوزات
        </p>

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="flex flex-col text-right">
            <label className="mb-1 text-sm text-[var(--color-grey)]">
              البريد الإلكتروني
            </label>
            <input
              required
              type="email"
              placeholder="admin@email.com"
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
              name="email"
              onChange={handleChange}
            />
          </div>
          {/* Password */}
          <div className="flex flex-col text-right relative">
            <label className="mb-1 text-sm text-[var(--color-grey)]">
              كلمة المرور
            </label>

            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="********"
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
              name="password"
              onChange={handleChange}
            />

            {/* Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-[34px] text-sm text-gray-400"
            >
              {showPassword ? "إخفاء" : "إظهار"}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-[var(--color-gold)] text-[var(--color-black)] py-2 rounded-lg font-semibold hover:opacity-90 transition"
            disabled={loading}
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
