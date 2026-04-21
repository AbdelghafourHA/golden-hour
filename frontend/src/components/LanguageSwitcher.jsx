import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "fr" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  return (
    <button
      onClick={toggleLanguage}
      className="group relative flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-300"
    >
      <Globe className="w-5 h-5 text-white group-hover:text-gold transition-colors" />
      <span className="text-sm font-medium text-white group-hover:text-gold transition-colors">
        {i18n.language === "ar" ? "FR" : "AR"}
      </span>
    </button>
  );
}
