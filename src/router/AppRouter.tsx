import { Navigate, Route, Routes } from 'react-router';
import App from '../App';

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/home" replace />} />
    <Route path="/*" element={<App />} />
  </Routes>
);
