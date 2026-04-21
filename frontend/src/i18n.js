import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import translationAR from "./locales/ar/translation.json";
import translationFR from "./locales/fr/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: translationAR },
      fr: { translation: translationFR },
    },
    fallbackLng: "ar",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
