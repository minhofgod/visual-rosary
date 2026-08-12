import { useState } from 'react';

export type DisplayLang = 'vi' | 'en' | 'both';

const STORAGE_KEY = 'rosary.displayLang';

export function useDisplayLang() {
  const [displayLang, setDisplayLangState] = useState<DisplayLang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'vi' || stored === 'en' || stored === 'both' ? stored : 'vi';
  });

  const setDisplayLang = (lang: DisplayLang) => {
    setDisplayLangState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  return { displayLang, setDisplayLang };
}
