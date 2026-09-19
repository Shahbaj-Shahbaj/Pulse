import { MdBolt, MdForum, MdTag } from 'react-icons/md';
import Brand from './Brand';

/**
 * Left-hand marketing panel shared by the Login and Register screens.
 * Hidden below 1024px, where the auth card takes the full width.
 */
export default function AuthAside({ headline, sub }) {
  return (
    <aside className="auth-visual">
      <Brand size="md" />

      <div className="auth-pitch">
        <h2>{headline}</h2>
        <p>{sub}</p>

        <div className="auth-features">
          <div className="auth-feature">
            <span className="af-ico"><MdBolt size={20} /></span>
            A real-time feed that keeps pace with you
          </div>
          <div className="auth-feature">
            <span className="af-ico"><MdTag size={20} /></span>
            Hashtags and moods that surface the good stuff
          </div>
          <div className="auth-feature">
            <span className="af-ico"><MdForum size={20} /></span>
            Comments, likes and bookmarks in one clean place
          </div>
        </div>
      </div>

      <p className="auth-quote">
        Pulse — where every post has a heartbeat.
      </p>
    </aside>
  );
}
