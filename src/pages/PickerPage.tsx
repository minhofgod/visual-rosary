import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MysteryPicker } from '../components/MysteryPicker';
import { LangToggle } from '../components/LangToggle';
import { useDisplayLang } from '../state/useDisplayLang';
import { todaysMysteryKey } from '../data/mysteries';
import type { MysteryKey } from '../data/types';

export function PickerPage() {
  const navigate = useNavigate();
  const { displayLang, setDisplayLang } = useDisplayLang();
  const [mysteryKey, setMysteryKey] = useState<MysteryKey>(() => todaysMysteryKey());

  return (
    <div className="app app-start">
      <MysteryPicker
        mysteryKey={mysteryKey}
        onSelect={setMysteryKey}
        onStart={() => navigate(`/${mysteryKey}/pray`)}
        displayLang={displayLang}
      />
      <LangToggle value={displayLang} onChange={setDisplayLang} />
    </div>
  );
}
