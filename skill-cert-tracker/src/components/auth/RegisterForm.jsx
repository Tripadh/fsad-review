import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlowInput from '../common/GlowInput';
import GlowButton from '../common/GlowButton';

const ROLES = [
  { value: 'user',  label: 'Professional', desc: 'Track your own certifications' },
  { value: 'admin', label: 'Administrator', desc: 'Manage all users & certificates' },
];

export default function RegisterForm({ onSwitchToLogin }) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [role, setRole]           = useState('user');
  const [error, setError]         = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading]     = useState(false);

  const validate = () => {
    const errs = {};
    if (!username.trim()) errs.username = 'Username is required.';
    else if (username.trim().length < 3) errs.username = 'Username must be at least 3 characters.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (!confirm) errs.confirm = 'Please confirm your password.';
    else if (password !== confirm) errs.confirm = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const user = await register(username.trim(), email.trim(), password, role);
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
        <div className="auth-form__title">Create account</div>
        <div className="auth-form__subtitle">Join CertTracker Pro today</div>
      </div>

      {error && <div className="auth-form__error">{error}</div>}

      {/* Role selector */}
      <div>
        <div
          style={{
            marginBottom: '0.5rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Account Type
        </div>
        <div className="role-picker">
          {ROLES.map(r => (
            <button
              key={r.value}
              type="button"
              className={`role-option${role === r.value ? ' role-option--active' : ''}`}
              onClick={() => setRole(r.value)}
            >
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.label}</span>
              <span style={{ fontSize: '0.68rem', opacity: 0.7, fontWeight: 400 }}>{r.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <GlowInput
        id="reg-username"
        label="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder=""
        error={fieldErrors.username}
        required
      />

      <GlowInput
        id="reg-email"
        label="Email Address"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder=""
        error={fieldErrors.email}
        required
      />

      <GlowInput
        id="reg-password"
        label="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder=""
        error={fieldErrors.password}
        required
      />

      <GlowInput
        id="reg-confirm"
        label="Confirm Password"
        type="password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        placeholder=""
        error={fieldErrors.confirm}
        required
      />

      <GlowButton type="submit" fullWidth size="lg" loading={loading}>
        Create Account
      </GlowButton>

      <div className="auth-form__divider">or</div>

      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <button
          type="button"
          style={{
            background: 'none', border: 'none',
            color: 'var(--glow-primary)', fontWeight: 600,
            cursor: 'pointer', fontSize: 'inherit',
          }}
          onClick={onSwitchToLogin}
        >
          Sign in here
        </button>
      </div>
    </form>
  );
}
