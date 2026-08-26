import { Navigate, Route, Routes } from 'react-router-dom';
import { PickerPage } from './pages/PickerPage';
import { ReadingPage } from './pages/ReadingPage';
import { PrayerWallPage } from './pages/PrayerWallPage';
import { ProfilePage } from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PickerPage />} />
      <Route path="/ho-so" element={<ProfilePage />} />
      <Route path="/y-cau-nguyen" element={<PrayerWallPage />} />
      <Route path="/:mysteryKey/pray" element={<ReadingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
