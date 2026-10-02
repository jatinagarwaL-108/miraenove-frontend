import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ReviewHistory from './pages/ReviewHistory';
import ChangeExplorer from './pages/ChangeExplorer';
import GenericCompare from './pages/GenericCompare';
import Reports from './pages/Reports';
import AnalysisPage from './pages/AnalysisPage';
import AuthGuard from './components/AuthGuard';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/dashboard" element={<Navigate to="/find-changes" replace />} />
                <Route path="/find-changes" element={
                    <AuthGuard>
                        <Dashboard />
                    </AuthGuard>
                } />
                <Route path="/review-center" element={<AuthGuard><ReviewHistory /></AuthGuard>} />
                <Route path="/change-explorer" element={<AuthGuard><ChangeExplorer /></AuthGuard>} />
                <Route path="/compare" element={<AuthGuard><GenericCompare /></AuthGuard>} />
                <Route path="/compare/:eventId" element={<AuthGuard><GenericCompare /></AuthGuard>} />
                <Route path="/reports" element={<AuthGuard><Reports /></AuthGuard>} />
                <Route path="/analysis/:eventId/:tab?" element={<AuthGuard><AnalysisPage /></AuthGuard>} />
            </Routes>
        </BrowserRouter>
    );
}
