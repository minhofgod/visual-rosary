import { Navigate, Route, Routes } from 'react-router-dom';
import { PickerPage } from './pages/PickerPage';
import { ReadingPage } from './pages/ReadingPage';
import { PrayerWallPage } from './pages/PrayerWallPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { useWallpaperSync } from './state/useWallpaperSync';
import './App.css';

function App() {
  useWallpaperSync(); // merge the device's wallpaper collection into the account on sign-in
  return (
    <Routes>
      <Route path="/" element={<PickerPage />} />
      <Route path="/ho-so" element={<ProfilePage />} />
      <Route path="/y-cau-nguyen" element={<PrayerWallPage />} />
      <Route path="/quan-tri" element={<AdminPage />} />
      <Route path="/:mysteryKey/pray" element={<ReadingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
