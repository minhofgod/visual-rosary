import { useRosary } from './state/useRosary';
import { useDisplayLang } from './state/useDisplayLang';
import { RosarySVG } from './components/RosarySVG';
import { PrayerCard } from './components/PrayerCard';
import { LangToggle } from './components/LangToggle';
import { MysteryPicker } from './components/MysteryPicker';
import { mysterySets } from './data/mysteries';
import './App.css';

function App() {
  const rosary = useRosary();
  const { displayLang, setDisplayLang } = useDisplayLang();

  if (rosary.currentStep === null) {
    return (
      <div className="app app-start">
        <MysteryPicker
          mysteryKey={rosary.mysteryKey}
          onSelect={rosary.setMysteryKey}
          onStart={rosary.start}
          displayLang={displayLang}
        />
        <LangToggle value={displayLang} onChange={setDisplayLang} />
      </div>
    );
  }

  const set = mysterySets[rosary.mysteryKey];

  return (
    <div className="app">
      <header className="app-header">
        <button type="button" className="header-restart" onClick={rosary.restart}>
          ← {displayLang === 'en' ? 'Restart' : 'Bắt đầu lại'}
        </button>
        <span className="header-mystery-name">
          {displayLang === 'en' ? set.name.en : set.name.vi}
        </span>
        <LangToggle value={displayLang} onChange={setDisplayLang} />
      </header>

      <main className="app-main">
        <RosarySVG currentBeadIndex={rosary.currentStep.beadIndex} onBeadClick={rosary.jumpToBead} />
        <PrayerCard
          step={rosary.currentStep}
          displayLang={displayLang}
          stepNumber={rosary.stepIndex! + 1}
          totalSteps={rosary.steps.length}
        />
      </main>

      <footer className="app-footer">
        <button type="button" onClick={rosary.prev} disabled={rosary.stepIndex === 0}>
          {displayLang === 'en' ? 'Back' : 'Trước'}
        </button>
        {rosary.isComplete ? (
          <button type="button" className="primary" onClick={rosary.restart}>
            {displayLang === 'en' ? 'Amen — Done' : 'Amen — Xong'}
          </button>
        ) : (
          <button type="button" className="primary" onClick={rosary.next}>
            {displayLang === 'en' ? 'Next' : 'Tiếp'}
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;
