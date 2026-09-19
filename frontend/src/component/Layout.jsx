import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import {
  MdHomeFilled, MdAddCircleOutline, MdBookmarkBorder, MdPersonOutline,
  MdSearch, MdClose, MdLogout, MdLightMode, MdDarkMode, MdExplore, MdAdd,
} from 'react-icons/md';
import Brand from './Brand';
import { Avatar } from './ui';
import ToastContainer from './ToastContainer';

const NAV = [
  { label: 'Home', icon: <MdHomeFilled />, path: '/' },
  { label: 'Explore', icon: <MdExplore />, path: '/explore' },
  { label: 'Bookmarks', icon: <MdBookmarkBorder />, path: '/bookmarks' },
  { label: 'Profile', icon: <MdPersonOutline />, path: '/profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, addToast } = useToast();

  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  /* Close the account menu whenever the route changes. */
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Signed out. See you soon.', 'info');
      navigate('/login');
    } catch {
      addToast('Could not sign out. Try again.', 'error');
    }
  };

  /* The nav search drives the home feed, so typing elsewhere returns there. */
  const handleSearch = (value) => {
    setSearch(value);
    if (value && location.pathname !== '/') navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-shell">
      <header className="topnav">
        <div className="topnav-inner">
          <div className="topnav-left">
            <button className="brand" onClick={() => navigate('/')} aria-label="Pulse home">
              <Brand />
            </button>

            <nav className="nav-links">
              {NAV.slice(0, 2).map(item => (
                <button
                  key={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}{item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="nav-search">
            <span className="s-icon"><MdSearch size={19} /></span>
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search posts on Pulse…"
              aria-label="Search posts"
            />
            {search && (
              <button className="s-clear" onClick={() => setSearch('')} aria-label="Clear search">
                <MdClose size={16} />
              </button>
            )}
          </div>

          <div className="topnav-actions">
            <button
              className="icon-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
            </button>

            <button
              className="btn btn-primary btn-sm u-desktop-only"
              onClick={() => navigate('/create')}
              style={{ height: 40 }}
            >
              <MdAdd size={18} /> Create
            </button>

            <div className="user-menu" ref={menuRef}>
              <button
                className="user-menu-trigger"
                onClick={() => setMenuOpen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <Avatar name={user?.username} size="sm" />
                <span className="um-name">@{user?.username}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
                  <div className="menu-pop" role="menu">
                    <div className="menu-head">
                      <Avatar name={user?.username} size="lg" />
                      <div style={{ minWidth: 0 }}>
                        <div className="mh-name">@{user?.username}</div>
                        <div className="mh-mail">{user?.email}</div>
                      </div>
                    </div>

                    {NAV.map(item => (
                      <button key={item.path} className="menu-item" onClick={() => navigate(item.path)}>
                        {item.icon} {item.label}
                      </button>
                    ))}

                    <button className="menu-item" onClick={toggleTheme}>
                      {theme === 'light' ? <MdDarkMode /> : <MdLightMode />}
                      {theme === 'light' ? 'Dark mode' : 'Light mode'}
                      <span className="mi-tail">{theme}</span>
                    </button>

                    <button className="menu-item danger" onClick={handleLogout}>
                      <MdLogout /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="app-body">
        <aside className="side-rail">
          <nav className="rail-card">
            <div className="rail-label">Menu</div>
            {NAV.map(item => (
              <button
                key={item.path}
                className={`rail-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={item.label}
              >
                <span className="ri-ico">{item.icon}</span>
                <span className="ri-text">{item.label}</span>
              </button>
            ))}
            <div className="rail-cta">
              <button className="btn btn-primary btn-block" onClick={() => navigate('/create')}>
                <MdAddCircleOutline size={19} /><span>New post</span>
              </button>
            </div>
          </nav>

          <div className="rail-promo">
            <h4>Find your rhythm</h4>
            <p>Share a thought, tag it, and watch the conversation build.</p>
          </div>
        </aside>

        <main className="page-body">
          <Outlet context={{ search, addToast }} />
        </main>
      </div>

      <footer className="app-footer">
        <Brand size="sm" />
        <span className="fdot">•</span>
        © {new Date().getFullYear()} Pulse
        <span className="fdot">•</span>
        Built with React, Node.js & MongoDB
      </footer>

      <nav className="tabbar">
        {NAV.slice(0, 2).map(item => (
          <button
            key={item.path}
            className={`tab-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="tb-ico">{item.icon}</span>{item.label}
          </button>
        ))}

        <button className="tab-item tab-cta" onClick={() => navigate('/create')}>
          <span className="tb-ico"><MdAdd size={20} /></span>Create
        </button>

        {NAV.slice(2).map(item => (
          <button
            key={item.path}
            className={`tab-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="tb-ico">{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
