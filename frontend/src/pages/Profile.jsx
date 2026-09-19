import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  MdGridView, MdFavorite, MdBookmark, MdChatBubble, MdMailOutline,
  MdEditNote, MdVerified, MdErrorOutline, MdAutoAwesome,
} from 'react-icons/md';
import api from '../assets/api';
import PostCard from '../component/PostCard';
import { Avatar, EmptyState, PostSkeleton } from '../component/ui';

export default function Profile() {
  const { user } = useAuth();
  const { addToast } = useOutletContext();
  const navigate = useNavigate();
const displayName =
  user?.name ||
  user?.fullName ||
  (user?.username === 'shabaj' ? 'Shahbaj' : user?.username);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [stats, setStats] = useState({ posts: 0, likes: 0, comments: 0, bookmarks: 0 });

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    setLoading(true);
    setFailed(false);
    api.get(`/posts/user/${userId}`)
      .then(res => {
        const p = res.data.posts;
        setPosts(p);
        setStats({
          posts: p.length,
          likes: p.reduce((a, b) => a + (b.reactions || 0), 0),
          comments: p.reduce((a, b) => a + (b.comments?.length || 0), 0),
          bookmarks: p.reduce((a, b) => a + (b.bookmarks?.length || 0), 0),
        });
      })
      .catch(() => { setFailed(true); addToast('Failed to load profile', 'error'); })
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = (id) => {
    setPosts(prev => prev.filter(p => p._id !== id));
    setStats(s => ({ ...s, posts: Math.max(0, s.posts - 1) }));
  };

  const memberSince = posts.length
    ? new Date(posts[posts.length - 1].createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const STATS = [
    { key: 'posts', label: 'Posts', value: stats.posts, icon: <MdAutoAwesome size={19} />, bg: 'linear-gradient(135deg,#6d45f0,#0d8bff)' },
    { key: 'likes', label: 'Likes received', value: stats.likes, icon: <MdFavorite size={19} />, bg: 'linear-gradient(135deg,#f43f5e,#f59e0b)' },
    { key: 'comments', label: 'Comments', value: stats.comments, icon: <MdChatBubble size={19} />, bg: 'linear-gradient(135deg,#10b981,#0d8bff)' },
    { key: 'bookmarks', label: 'Times saved', value: stats.bookmarks, icon: <MdBookmark size={19} />, bg: 'linear-gradient(135deg,#0ea5e9,#6366f1)' },
  ];

  return (
    <div>
      <section className="profile-hero">
        <div className="profile-cover" />
        <div className="profile-id">
          <Avatar name={user?.username} size="xl" />
          <div className="profile-meta">
<h2>
  {displayName}{' '}
  <MdVerified
    size={19}
    style={{ color: 'var(--accent-500)', verticalAlign: '-3px' }}
  />
</h2>
            <div className="profile-handle">@{user?.username}</div>
            <div className="profile-sub">
              <span className="ps-item"><MdMailOutline size={15} /> {user?.email}</span>
              <span className="ps-item"><MdGridView size={15} /> {stats.posts} post{stats.posts === 1 ? '' : 's'}</span>
              <span className="ps-item">Active since {memberSince}</span>
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn btn-primary" onClick={() => navigate('/create')}>
              <MdEditNote size={19} /> New post
            </button>
          </div>
        </div>
      </section>
      

      <div className="stats-grid">
        {STATS.map(s => (
          <div className="stat-card" key={s.key}>
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="section-head">
        <div>
          <h3 className="section-title"><span className="ti"><MdGridView size={18} /></span> Your posts</h3>
          <p className="section-sub">Everything you’ve published on Pulse.</p>
        </div>
      </div>

      <div className="profile-posts">
        {loading ? (
          <PostSkeleton count={2} />
        ) : failed ? (
          <EmptyState
            variant="danger"
            icon={<MdErrorOutline size={32} />}
            title="Couldn’t load your posts"
            message="Something went wrong reaching the server. Refresh to try again."
            action={<button className="btn btn-primary" onClick={() => window.location.reload()}>Refresh</button>}
          />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<MdEditNote size={32} />}
            title="No posts yet"
            message="Your published posts will show up here. Write your first one — it takes a minute."
            action={<button className="btn btn-primary" onClick={() => navigate('/create')}>Create a post</button>}
          />
        ) : (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handleDelete}
              onUpdate={() => {}}
              addToast={addToast}
            />
          ))
        )}
      </div>
    </div>
  );
}
