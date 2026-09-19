import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import {
  MdMailOutline, MdLockOutline, MdPersonOutline, MdVisibility, MdVisibilityOff,
  MdLightMode, MdDarkMode, MdErrorOutline, MdArrowForward,
} from 'react-icons/md';
import Brand from '../component/Brand';
import AuthAside from '../component/AuthAside';

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

const scorePassword = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^\w\s]/.test(pw)) score++;
  return Math.min(score, 4);
};

export default function Register() {
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = scorePassword(form.password);

  return (
    <div className="auth-shell">
      <AuthAside
        headline="Start your Pulse in under a minute."
        sub="Create an account, publish your first post and join the conversations already happening."
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
            <h1>Create your account</h1>
            <p>Free forever. No credit card, no noise.</p>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <MdErrorOutline size={18} /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <div className="field">
                <span className="field-icon"><MdPersonOutline size={19} /></span>
                <input
                  id="username"
                  type="text"
                  name="username"
                  className="input"
                  placeholder="Pick a handle"
                  value={form.username}
                  onChange={handleChange}
                  minLength={3}
                  maxLength={20}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  autoComplete="new-password"
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

              {form.password && (
                <>
                  <div className={`strength s${strength}`}>
                    <span /><span /><span /><span />
                  </div>
                  <div className="strength-label">{STRENGTH_LABELS[strength]}</div>
                </>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading
                ? <><span className="spinner sm" style={{ borderTopColor: '#fff' }} /> Creating account…</>
                : <>Create account <MdArrowForward size={18} /></>}
            </button>
          </form>

          <p className="legal-note">
            By creating an account you agree to keep Pulse a kind place to post.
          </p>

          <div className="auth-divider">ALREADY HERE?</div>

          <div className="auth-switch">
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('/login')}>Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}
