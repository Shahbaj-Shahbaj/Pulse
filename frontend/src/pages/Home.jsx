import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  MdTrendingUp, MdChevronLeft, MdChevronRight, MdEditNote, MdSearchOff, MdErrorOutline,
} from 'react-icons/md';
import api from '../assets/api';
import PostCard from '../component/PostCard';
import { Avatar, EmptyState, PostSkeleton } from '../component/ui';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { search, addToast } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTag, setActiveTag] = useState('');
  const [trendingTags, setTrendingTags] = useState([]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const params = { page, limit: 8 };
      if (search) params.search = search;
      if (activeTag) params.tag = activeTag;

      const res = await api.get('/posts', { params });
      setPosts(res.data.posts);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total ?? res.data.posts.length);

      const tagMap = {};
      res.data.posts.forEach(p => p.tags?.forEach(t => { if (t) tagMap[t] = (tagMap[t] || 0) + 1; }));
      setTrendingTags(Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 8));
    } catch {
      setFailed(true);
      addToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, activeTag]);

  useEffect(() => {
    const delay = setTimeout(fetchPosts, search ? 400 : 0);
    return () => clearTimeout(delay);
  }, [fetchPosts]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  const handleDelete = (id) => setPosts(prev => prev.filter(p => p._id !== id));
  const handleUpdate = (updated) => setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));
  const pickTag = (tag) => { setActiveTag(tag); setPage(1); };

  return (
    <div className="feed-layout">
      <div className="feed-col">
        <button className="composer-teaser" onClick={() => navigate('/create')}>
          <Avatar name={user?.username} size="lg" ring />
          <span className="ct-fake">What’s happening, @{user?.username}?</span>
          <span className="btn btn-primary btn-sm"><MdEditNote size={18} /> Post</span>
        </button>

        {trendingTags.length > 0 && (
          <div className="chip-row scroll">
            <button
              className={`chip ${activeTag === '' ? 'active' : ''}`}
              onClick={() => pickTag('')}
            >
              Latest
            </button>
            {trendingTags.map(([tag, count]) => (
              <button
                key={tag}
                className={`chip ${activeTag === tag ? 'active' : ''}`}
                onClick={() => pickTag(tag)}
              >
                #{tag}
                <span className="pill-count" style={activeTag === tag ? { background: 'rgba(255,255,255,.22)', color: '#fff' } : {}}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}

        {(search || activeTag) && !loading && !failed && (
          <div className="result-meta">
            <strong>{total}</strong> result{total === 1 ? '' : 's'}
            {search && <> for “<strong>{search}</strong>”</>}
            {activeTag && <> tagged <strong>#{activeTag}</strong></>}
          </div>
        )}

        {loading ? (
          <PostSkeleton count={3} />
        ) : failed ? (
          <EmptyState
            variant="danger"
            icon={<MdErrorOutline size={32} />}
            title="We couldn’t load your feed"
            message="Check that the backend is running, then try again."
            action={<button className="btn btn-primary" onClick={fetchPosts}>Retry</button>}
          />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<MdSearchOff size={32} />}
            title={search || activeTag ? 'Nothing matched' : 'Your feed is quiet'}
            message={
              search
                ? `No posts match “${search}”. Try a different phrase or clear the search.`
                : activeTag
                  ? `Nothing tagged #${activeTag} yet.`
                  : 'Be the first to publish something and get the conversation started.'
            }
            action={
              search || activeTag
                ? <button className="btn btn-soft" onClick={() => pickTag('')}>Show latest posts</button>
                : <button className="btn btn-primary" onClick={() => navigate('/create')}>Create your first post</button>
            }
          />
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                addToast={addToast}
                onTagClick={pickTag}
              />
            ))}

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-soft btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <MdChevronLeft size={18} /> Prev
                </button>
                <span className="page-indicator">Page {page} of {totalPages}</span>
                <button
                  className="btn btn-soft btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <MdChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <aside className="right-rail">
        {trendingTags.length > 0 && (
          <div className="widget">
            <h4><MdTrendingUp size={19} /> Trending on Pulse</h4>
            {trendingTags.map(([tag, count], i) => (
              <button
                key={tag}
                className={`trend-item ${activeTag === tag ? 'active' : ''}`}
                onClick={() => pickTag(tag)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="trend-rank">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="trend-name">#{tag}</span>
                    <span className="trend-count" style={{ display: 'block' }}>
                      {count} post{count === 1 ? '' : 's'}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="widget">
          <h4>Posting tips</h4>
          <ul style={{ paddingLeft: 18, fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.85 }}>
            <li>Lead with a clear, specific title.</li>
            <li>Add 2–4 hashtags so people can find it.</li>
            <li>Set a mood to give your post tone.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
