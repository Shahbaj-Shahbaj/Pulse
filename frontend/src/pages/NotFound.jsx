import { useNavigate } from 'react-router-dom';
import { MdHomeFilled } from 'react-icons/md';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="nf-page">
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div className="nf-code">404</div>
        <h2 style={{ fontSize: 22, margin: '10px 0 8px' }}>This page has no pulse</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14.5, marginBottom: 22 }}>
          The page you’re looking for was moved or never existed.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
          <MdHomeFilled size={19} /> Back to feed
        </button>
      </div>
    </div>
  );
}
