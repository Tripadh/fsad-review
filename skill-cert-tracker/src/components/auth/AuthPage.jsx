import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/auth.css';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthPage() {
  const location = useLocation();
  const initialMode = location.state?.mode === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode);

  const formAreaRef = useRef(null);
  const panelRef    = useRef(null);

  // Measure form area and set panel height for smooth transition
  useEffect(() => {
    const panel    = panelRef.current;
    const formArea = formAreaRef.current;
    if (!panel || !formArea) return;
    panel.style.height = `${formArea.scrollHeight}px`;
  }, [mode]);

  return (
    <div className="auth-page">

      {/* Logo — large, centred above the panel */}
      <img
        src="/logorbg.png"
        alt="CertTracker Pro"
        className="auth-top-logo"
      />

      {/* Form panel */}
      <div className="auth-panel" ref={panelRef}>
        <div className="auth-form-area" ref={formAreaRef}>
          {mode === 'login' ? (
            <LoginForm key="login" onSwitchToRegister={() => setMode('register')} />
          ) : (
            <RegisterForm key="register" onSwitchToLogin={() => setMode('login')} />
          )}
        </div>
      </div>

    </div>
  );
}
