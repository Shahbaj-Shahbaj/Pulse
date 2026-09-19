import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  MdSend, MdTag, MdLocationOn, MdMyLocation, MdClose, MdErrorOutline, MdArrowBack,
} from 'react-icons/md';
import api from '../assets/api';

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '💡', label: 'Inspired' },
  { emoji: '🔥', label: 'Excited' },
  { emoji: '🤔', label: 'Thoughtful' },
  { emoji: '😎', label: 'Confident' },
  { emoji: '💪', label: 'Motivated' },
];

const MAX_CHARS = 2000;

export default function CreatePost() {
  const navigate = useNavigate();
  const { addToast } = useOutletContext();

  const [form, setForm] = useState({ title: '', body: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [mood, setMood] = useState('');

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation not supported by your browser', 'error');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
          const state = data.address?.state || '';
          const country = data.address?.country || '';
          const name = [city, state, country].filter(Boolean).join(', ');
          setLocationName(name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          addToast('Location attached to your post', 'success');
        } catch {
          setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setLocationLoading(false);
      },
      () => {
        addToast('Could not get location. Please allow access.', 'error');
        setLocationLoading(false);
      }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    setLocationName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and content are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const tags = form.tags.trim().split(/\s+/).filter(Boolean);
      await api.post('/posts', {
        title: form.title,
        body: form.body,
        tags,
        mood: mood || null,
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          name: locationName,
        } : null,
      });
      addToast('Your post is live on Pulse', 'success');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  const charCount = form.body.length;
  const tagList = form.tags.trim() ? form.tags.trim().split(/\s+/).filter(Boolean) : [];

  return (
    <div className="narrow-page">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: 14 }}>
        <MdArrowBack size={18} /> Back to feed
      </button>

      <div className="compose-card">
        <div className="compose-hero">
          <h2>Create a post</h2>
          <p>Share an idea, an update or a question with the Pulse community.</p>
        </div>

        <div className="compose-body">
          {error && (
            <div className="alert alert-error" role="alert">
              <MdErrorOutline size={18} /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">How are you feeling?</label>
              <div className="mood-picker">
                {MOODS.map(m => (
                  <button
                    type="button"
                    key={m.label}
                    className={`mood-btn ${mood === m.label ? 'active' : ''}`}
                    onClick={() => setMood(prev => (prev === m.label ? '' : m.label))}
                  >
                    <span className="m-emoji">{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="title">Title <span className="opt">· required</span></label>
              <input
                id="title"
                name="title"
                className="input"
                placeholder="Give your post a clear headline"
                value={form.title}
                onChange={handleChange}
                maxLength={120}
                required
              />
              <div className="char-counter">{form.title.length}/120</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="body">Content <span className="opt">· required</span></label>
              <textarea
                id="body"
                name="body"
                className="input"
                placeholder="Tell the community more about it…"
                value={form.body}
                onChange={handleChange}
                rows={7}
                maxLength={MAX_CHARS}
                required
              />
              <div className={`char-counter ${charCount > MAX_CHARS * 0.9 ? 'warn' : ''}`}>
                {charCount}/{MAX_CHARS}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tags">
                <MdTag size={15} /> Hashtags <span className="opt">· space separated</span>
              </label>
              <input
                id="tags"
                name="tags"
                className="input"
                placeholder="react placement internship design"
                value={form.tags}
                onChange={handleChange}
              />
              {tagList.length > 0 && (
                <div className="tag-preview">
                  {tagList.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <MdLocationOn size={15} /> Location <span className="opt">· optional</span>
              </label>
              {location ? (
                <div className="location-badge">
                  <MdLocationOn size={17} />
                  <span>{locationName}</span>
                  <button type="button" onClick={clearLocation} className="location-clear" aria-label="Remove location">
                    <MdClose size={15} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="location-btn"
                  onClick={fetchLocation}
                  disabled={locationLoading}
                >
                  <MdMyLocation size={17} />
                  {locationLoading ? 'Getting your location…' : 'Attach my location'}
                </button>
              )}
            </div>

            <div className="compose-footer">
              <span className="cf-hint">Posts are public to everyone on Pulse.</span>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading
                  ? <><span className="spinner sm" style={{ borderTopColor: '#fff' }} /> Publishing…</>
                  : <><MdSend size={18} /> Publish post</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
