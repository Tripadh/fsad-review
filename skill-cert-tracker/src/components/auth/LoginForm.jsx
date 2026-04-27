import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlowInput from '../common/GlowInput';
import GlowButton from '../common/GlowButton';

export default function LoginForm({ onSwitchToRegister }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/user', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div>
        <div className="auth-form__title">Welcome back</div>
        <div className="auth-form__subtitle">Sign in to manage your certifications</div>
      </div>

      {error && (
        <div className="auth-form__error">
          {error}
          {error === 'No account found with this email.' && (
            <div style={{ marginTop: '0.6rem' }}>
              <button
                type="button"
                onClick={onSwitchToRegister}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--glow-primary)',
                  background: 'rgba(249,115,22,0.12)',
                  color: 'var(--glow-primary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                }}
              >
                Create an account instead →
              </button>
            </div>
          )}
        </div>
      )}

      <GlowInput
        id="login-email"
        label="Email Address"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder=""
        required
      />

      <GlowInput
        id="login-password"
        label="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder=""
        required
      />

      <GlowButton type="submit" fullWidth size="lg" loading={loading}>
        Sign In →
      </GlowButton>

      <div className="auth-form__divider">or</div>

      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Don&apos;t have an account?{' '}
        <button
          type="button"
          style={{ background: 'none', border: 'none', color: 'var(--glow-primary)', fontWeight: 600, cursor: 'pointer', fontSize: 'inherit' }}
          onClick={onSwitchToRegister}
        >
          Register here
        </button>
      </div>
    </form>
  );
}
