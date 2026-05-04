import { createContext, useContext } from 'react';
import { Lang, T, translations } from './i18n';

interface LangCtx {
  lang: Lang;
  T: T;
}

const LangContext = createContext<LangCtx>({ lang: 'ru', T: translations.ru });

export const useLang = () => useContext(LangContext);
export default LangContext;
