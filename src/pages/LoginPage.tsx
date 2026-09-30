import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    
    const handleDemo = () => {
        localStorage.setItem('miraenova_demo_auth', 'true');
        navigate('/dashboard');
    };
    
    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
            <div style={{ flex: 1, background: '#f7f8fa', borderRight: '1px solid #eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h1 style={{ fontSize: '48px', color: '#ccc' }}>MiraeNova</h1>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '400px', padding: '40px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                    <h2 style={{ margin: '0 0 10px 0' }}>Welcome back</h2>
                    <p style={{ color: '#666', margin: '0 0 30px 0' }}>Sign in to continue to MiraeNova</p>
                    
                    <input type="email" placeholder="Email" style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                    <input type="password" placeholder="Password" style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                    
                    <button style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px' }}>Sign In</button>
                    
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <span style={{ color: '#666' }}>Don't have an account? </span>
                        <Link to="/signup" style={{ color: '#000', textDecoration: 'none', fontWeight: 'bold' }}>Create account</Link>
                    </div>
                    
                    <hr style={{ border: 'none', borderTop: '1px solid #eaeaea', marginBottom: '20px' }} />
                    
                    <button onClick={handleDemo} style={{ width: '100%', padding: '10px', background: '#f7f8fa', color: '#000', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Continue as Demo</button>
                </div>
            </div>
        </div>
    );
}