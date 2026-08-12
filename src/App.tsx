import { useState } from 'react';
import { useRosary } from './state/useRosary';
import { useDisplayLang } from './state/useDisplayLang';
import { useSwipeNav } from './state/useSwipeNav';
import { useSettings } from './state/useSettings';
import { BeadRail } from './components/BeadRail';
import { PrayerCard } from './components/PrayerCard';
import { LangToggle } from './components/LangToggle';
import { MysteryPicker } from './components/MysteryPicker';
import { SettingsPanel } from './components/SettingsPanel';
import { mysterySets } from './data/mysteries';
import { getRailView } from './data/railView';
import { getMysteryImage } from './data/mysteryImages';
import './App.css';

function App() {
  const rosary = useRosary();
  const { displayLang, setDisplayLang } = useDisplayLang();
  const { settings, setSettings } = useSettings();
  const swipe = useSwipeNav(rosary.next, rosary.prev);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
  const rail = getRailView(rosary.currentStep);
  const currentMystery = rosary.currentStep.decadeNumber ? set.list[rosary.currentStep.decadeNumber - 1] : undefined;
  const image = currentMystery ? getMysteryImage(currentMystery.imageKey) : undefined;

  return (
    <div className="reading-screen">
      <div
        className={`bg-layer bg-${rosary.mysteryKey}`}
        style={image ? { backgroundImage: `url(${image.file})` } : undefined}
      />
      <div className="bg-scrim" />
      {image && (
        <div className="bg-credit">
          {image.title}, {image.artist} — Public domain, via Wikimedia Commons
        </div>
      )}

      <header className="reading-header">
        <button type="button" className="icon-button" onClick={rosary.restart} aria-label="restart">
          ←
        </button>
        <span className="reading-mystery-name">{displayLang === 'en' ? set.name.en : set.name.vi}</span>
        <div className="reading-header-right">
          <LangToggle value={displayLang} onChange={setDisplayLang} />
          <button type="button" className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="settings">
            ⚙
          </button>
        </div>
      </header>

      <div className="reading-body">
        {settings.beadPosition === 'left' && (
          <BeadRail rail={rail} position="left" displayLang={displayLang} onBeadClick={rosary.jumpToBead} />
        )}

        <main
          className="reading-main"
          onTouchStart={swipe.onTouchStart}
          onTouchEnd={swipe.onTouchEnd}
          onMouseDown={swipe.onMouseDown}
          onMouseUp={swipe.onMouseUp}
        >
          <PrayerCard
            step={rosary.currentStep}
            displayLang={displayLang}
            stepNumber={rosary.stepIndex! + 1}
            totalSteps={rosary.steps.length}
            showFruits={settings.showFruits}
            showMeditations={settings.showMeditations}
          />
        </main>

        {settings.beadPosition === 'right' && (
          <BeadRail rail={rail} position="right" displayLang={displayLang} onBeadClick={rosary.jumpToBead} />
        )}
      </div>

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => setSettingsOpen(false)}
          displayLang={displayLang}
        />
      )}
    </div>
  );
}

export default App;
