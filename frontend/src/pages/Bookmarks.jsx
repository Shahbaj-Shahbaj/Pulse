import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MdBookmarkBorder, MdBookmarks, MdErrorOutline } from 'react-icons/md';
import api from '../assets/api';
import PostCard from '../component/PostCard';
import { EmptyState, PostSkeleton } from '../component/ui';

export default function Bookmarks() {
  const { addToast } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.get('/posts', { params: { limit: 100 } })
      .then(res => {
        const uid = user?._id || user?.id;
        setPosts(res.data.posts.filter(p => p.bookmarks?.includes(uid)));
      })
      .catch(() => { setFailed(true); addToast('Failed to load bookmarks', 'error'); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => setPosts(prev => prev.filter(p => p._id !== id));

  const handleUpdate = (updated) => {
    const uid = user?._id || user?.id;
    if (!updated.bookmarks?.includes(uid)) {
      setPosts(prev => prev.filter(p => p._id !== updated._id));
    } else {
      setPosts(prev => prev.map(p => (p._id === updated._id ? updated : p)));
    }
  };

  return (
    <div className="narrow-page">
      <div className="section-head">
        <div>
          <h3 className="section-title">
            <span className="ti"><MdBookmarks size={18} /></span> Saved posts
          </h3>
          <p className="section-sub">
            {loading
              ? 'Loading your collection…'
              : `${posts.length} post${posts.length === 1 ? '' : 's'} saved for later.`}
          </p>
        </div>
      </div>

      <div className="results-col">
        {loading ? (
          <PostSkeleton count={2} />
        ) : failed ? (
          <EmptyState
            variant="danger"
            icon={<MdErrorOutline size={32} />}
            title="Couldn’t load bookmarks"
            message="The server didn’t respond. Refresh the page to try again."
            action={<button className="btn btn-primary" onClick={() => window.location.reload()}>Refresh</button>}
          />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<MdBookmarkBorder size={32} />}
            title="Nothing saved yet"
            message="Tap Save on any post and it will be waiting for you here."
            action={<button className="btn btn-primary" onClick={() => navigate('/')}>Browse the feed</button>}
          />
        ) : (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              addToast={addToast}
            />
          ))
        )}
      </div>
    </div>
  );
}
