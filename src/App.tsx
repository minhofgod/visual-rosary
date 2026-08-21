import { Navigate, Route, Routes } from 'react-router-dom';
import { PickerPage } from './pages/PickerPage';
import { ReadingPage } from './pages/ReadingPage';
import { PrayerWallPage } from './pages/PrayerWallPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PickerPage />} />
      {/* Prayer wall is dev-only for now — the sign-in/custom-domain setup isn't ready,
          so it's hidden from the production build. Flip these back on to launch it. */}
      {import.meta.env.DEV && <Route path="/y-cau-nguyen" element={<PrayerWallPage />} />}
      <Route path="/:mysteryKey/pray" element={<ReadingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
