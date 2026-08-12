import type { DisplayLang } from '../state/useDisplayLang';

interface Props {
  value: DisplayLang;
  onChange: (lang: DisplayLang) => void;
}

const OPTIONS: { value: DisplayLang; label: string }[] = [
  { value: 'vi', label: 'VI' },
  { value: 'en', label: 'EN' },
  { value: 'both', label: 'VI + EN' },
];

export function LangToggle({ value, onChange }: Props) {
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={opt.value === value ? 'is-active' : ''}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
