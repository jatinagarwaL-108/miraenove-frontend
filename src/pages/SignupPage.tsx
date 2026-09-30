import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
    const navigate = useNavigate();
    
    const handleSignup = () => {
        alert("Demo account created locally.");
        localStorage.setItem('miraenova_demo_auth', 'true');
        navigate('/dashboard');
    };
    
    return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
            <div style={{ width: '400px', padding: '40px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                <h2 style={{ margin: '0 0 30px 0' }}>Create Account</h2>
                <input type="text" placeholder="Name" style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                <input type="email" placeholder="Email" style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                <input type="password" placeholder="Password" style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                <button onClick={handleSignup} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create Account</button>
            </div>
        </div>
    );
}