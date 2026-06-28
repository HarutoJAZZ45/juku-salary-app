import { Navigate, Route, Routes } from 'react-router';
import App from '../App';

export const AppRouter = () => (
  <Routes>
    <Route path="/home" element={<App />} />
    <Route path="/" element={<Navigate to="/home" replace />} />
    <Route path="*" element={<Navigate to="/home" replace />} />
  </Routes>
);
