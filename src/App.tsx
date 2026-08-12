import { Route, Routes } from 'react-router-dom';
import { PickerPage } from './pages/PickerPage';
import { ReadingPage } from './pages/ReadingPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PickerPage />} />
      <Route path="/:mysteryKey/pray" element={<ReadingPage />} />
    </Routes>
  );
}

export default App;
