import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  MdSearch, MdClose, MdSearchOff, MdErrorOutline, MdChevronLeft, MdChevronRight, MdTravelExplore,
} from 'react-icons/md';
import api from '../assets/api';
import PostCard from '../component/PostCard';
import { EmptyState, PostSkeleton } from '../component/ui';

/**
 * Dedicated search surface. Uses the same GET /posts endpoint
 * (search, tag, page, limit) that the feed already relies on.
 */
export default function Explore() {
  const { addToast } = useOutletContext();

  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const params = { page, limit: 10 };
      if (query.trim()) params.search = query.trim();
      if (activeTag) params.tag = activeTag;

      const res = await api.get('/posts', { params });
      setPosts(res.data.posts);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total ?? res.data.posts.length);

      if (!query.trim() && !activeTag) {
        const tagMap = {};
        res.data.posts.forEach(p => p.tags?.forEach(t => { if (t) tagMap[t] = (tagMap[t] || 0) + 1; }));
        setTags(Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 12));
      }
    } catch {
      setFailed(true);
      addToast('Search failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [query, activeTag, page]);

  useEffect(() => {
    const t = setTimeout(fetchResults, query ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchResults]);

  const handleDelete = (id) => setPosts(prev => prev.filter(p => p._id !== id));
  const handleUpdate = (updated) => setPosts(prev => prev.map(p => (p._id === updated._id ? updated : p)));

  const pickTag = (tag) => { setActiveTag(prev => (prev === tag ? '' : tag)); setPage(1); };
  const reset = () => { setQuery(''); setActiveTag(''); setPage(1); };
  const isFiltered = Boolean(query.trim() || activeTag);

  return (
    <div className="narrow-page">
      <section className="explore-hero">
        <h2>Explore Pulse</h2>
        <p>Search every post, or jump in through a hashtag.</p>

        <div className="explore-search">
          <span className="es-icon"><MdSearch size={21} /></span>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search titles and content…"
            aria-label="Search posts"
          />
          {query && (
            <button className="icon-btn sm es-clear" onClick={() => setQuery('')} aria-label="Clear search">
              <MdClose size={18} />
            </button>
          )}
        </div>

        {tags.length > 0 && (
          <div className="chip-row" style={{ marginTop: 16 }}>
            {tags.map(([tag, count]) => (
              <button
                key={tag}
                className={`chip ${activeTag === tag ? 'active' : ''}`}
                onClick={() => pickTag(tag)}
              >
                #{tag}
                <span
                  className="pill-count"
                  style={activeTag === tag ? { background: 'rgba(255,255,255,.22)', color: '#fff' } : {}}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {isFiltered && !loading && !failed && (
        <div className="result-meta">
          <strong>{total}</strong> result{total === 1 ? '' : 's'}
          {query.trim() && <> for “<strong>{query.trim()}</strong>”</>}
          {activeTag && <> in <strong>#{activeTag}</strong></>}
          {' · '}
          <button className="btn btn-ghost btn-sm" onClick={reset}>Clear</button>
        </div>
      )}

      <div className="results-col">
        {loading ? (
          <PostSkeleton count={3} />
        ) : failed ? (
          <EmptyState
            variant="danger"
            icon={<MdErrorOutline size={32} />}
            title="Search unavailable"
            message="We couldn’t reach the server. Try again in a moment."
            action={<button className="btn btn-primary" onClick={fetchResults}>Retry</button>}
          />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={isFiltered ? <MdSearchOff size={32} /> : <MdTravelExplore size={32} />}
            title={isFiltered ? 'No matches found' : 'Nothing to explore yet'}
            message={
              isFiltered
                ? 'Try a shorter phrase, or clear the filters to see everything.'
                : 'Once posts are published they’ll be searchable right here.'
            }
            action={isFiltered ? <button className="btn btn-soft" onClick={reset}>Clear filters</button> : null}
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
                <button className="btn btn-soft btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <MdChevronLeft size={18} /> Prev
                </button>
                <span className="page-indicator">Page {page} of {totalPages}</span>
                <button className="btn btn-soft btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  Next <MdChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
