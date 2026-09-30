import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import AnalysisPage from './pages/AnalysisPage';
import AuthGuard from './components/AuthGuard';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/dashboard" element={
                    <AuthGuard>
                        <Dashboard />
                    </AuthGuard>
                } />
                <Route path="/analysis/:eventId/:tab?" element={<AuthGuard><AnalysisPage /></AuthGuard>} />
            </Routes>
        </BrowserRouter>
    );
}
