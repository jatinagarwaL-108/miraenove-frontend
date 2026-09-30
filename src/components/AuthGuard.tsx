import { Navigate } from 'react-router-dom';

export default function AuthGuard({ children }: { children: JSX.Element }) {
    const auth = localStorage.getItem('miraenova_demo_auth');
    if (!auth) {
        return <Navigate to="/login" replace />;
    }
    return children;
}