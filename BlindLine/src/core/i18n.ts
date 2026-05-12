import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from 'expo-localization';

import languages from "./languages";

// Get the primary language code from the device's locale settings
const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources: languages,
  // Use the detected language, but fall back to 'en' if it's not a supported language
  lng: Object.keys(languages).includes(deviceLanguage) ? deviceLanguage : 'en',
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
