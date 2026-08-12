export type Lang = 'vi' | 'en';

export interface Bilingual {
  vi: string;
  en: string;
}

export type MysteryKey = 'joyful' | 'luminous' | 'sorrowful' | 'glorious';

export interface Mystery {
  order: number;
  title: Bilingual;
  petition: Bilingual;
  /** Short 1-4 word fruit name for the bottom footer bar, e.g. { vi: 'Khiêm Nhường', en: 'Humility' } */
  fruitShort: Bilingual;
  meditation: Bilingual;
  /** key into mysteryImages.ts for the full-bleed background painting */
  imageKey: string;
}

export interface MysterySet {
  key: MysteryKey;
  name: Bilingual;
  /** JS Date#getDay() values (0=Sun..6=Sat) this set is traditionally prayed on */
  days: number[];
  list: Mystery[];
}
