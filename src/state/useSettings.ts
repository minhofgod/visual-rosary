import { useState } from 'react';

export type BeadPosition = 'left' | 'right' | 'hidden';

export interface Settings {
  beadPosition: BeadPosition;
  showFruits: boolean;
  showMeditations: boolean;
  showScriptures: boolean;
}

const STORAGE_KEY = 'rosary.settings';

const defaults: Settings = {
  beadPosition: 'right',
  showFruits: true,
  showMeditations: true,
  showScriptures: true,
};

function load(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaults;
    return { ...defaults, ...JSON.parse(stored) };
  } catch {
    return defaults;
  }
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(load);

  const setSettings = (patch: Partial<Settings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { settings, setSettings };
}
