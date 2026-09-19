import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import {
  MdMailOutline, MdLockOutline, MdVisibility, MdVisibilityOff,
  MdLightMode, MdDarkMode, MdErrorOutline, MdArrowForward,
} from 'react-icons/md';
import Brand from '../component/Brand';
import AuthAside from '../component/AuthAside';

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <AuthAside
        headline="Your feed, finally in rhythm."
        sub="Sign in to pick up the conversations you care about — the posts, replies and saves you left behind."
      />

      <div className="auth-panel">
        <button
          className="icon-btn is-filled auth-theme-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
        </button>

        <div className="auth-card">
          <div className="mobile-brand"><Brand size="md" /></div>

          <div className="auth-heading">
            <h1>Welcome back</h1>
            <p>Sign in to your Pulse account to continue.</p>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <MdErrorOutline size={18} /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate={false}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <div className="field">
                <span className="field-icon"><MdMailOutline size={19} /></span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="field">
                <span className="field-icon"><MdLockOutline size={19} /></span>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  className="input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <span className="field-trail">
                  <button
                    type="button"
                    className="icon-btn sm pw-toggle"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading
                ? <><span className="spinner sm" style={{ borderTopColor: '#fff' }} /> Signing in…</>
                : <>Sign in <MdArrowForward size={18} /></>}
            </button>
          </form>

          <div className="auth-divider">NEW TO PULSE?</div>

          <div className="auth-switch">
            Don’t have an account?{' '}
            <button type="button" onClick={() => navigate('/register')}>Create one free</button>
          </div>
        </div>
      </div>
    </div>
  );
}
