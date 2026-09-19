import { useState } from 'react';
import {
  MdDeleteOutline, MdFavorite, MdFavoriteBorder, MdBookmark, MdBookmarkBorder,
  MdChatBubbleOutline, MdSend, MdLocationOn, MdNorthEast,
} from 'react-icons/md';
import api from '../assets/api';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from './ui';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const MOOD_EMOJIS = {
  Happy: '😊', Inspired: '💡', Excited: '🔥',
  Thoughtful: '🤔', Confident: '😎', Motivated: '💪',
};

export default function PostCard({ post, onDelete, onUpdate, addToast, onTagClick }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  const uid = user?._id || user?.id;
  const isOwner = uid === localPost.userId;
  const isLiked = localPost.likedBy?.includes(uid);
  const isSaved = localPost.bookmarks?.includes(uid);
  const commentCount = localPost.comments?.length || 0;
  const imageUrl = localPost.image || localPost.imageUrl;

  /* ---- API handlers (unchanged endpoints & payloads) ---- */
  const handleLike = async () => {
    try {
      const res = await api.patch(`/posts/${localPost._id}/like`);
      setLocalPost(p => ({
        ...p,
        reactions: res.data.reactions,
        likedBy: res.data.liked
          ? [...(p.likedBy || []), uid]
          : (p.likedBy || []).filter(id => id !== uid),
      }));
      if (onUpdate) onUpdate({ ...localPost, reactions: res.data.reactions });
    } catch { addToast('Failed to like post', 'error'); }
  };

  const handleBookmark = async () => {
    try {
      const res = await api.patch(`/posts/${localPost._id}/bookmark`);
      const next = {
        ...localPost,
        bookmarks: res.data.bookmarked
          ? [...(localPost.bookmarks || []), uid]
          : (localPost.bookmarks || []).filter(id => id !== uid),
      };
      setLocalPost(next);
      if (onUpdate) onUpdate(next);
      addToast(res.data.bookmarked ? 'Saved to your bookmarks' : 'Removed from bookmarks', 'success');
    } catch { addToast('Failed to bookmark', 'error'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/posts/${localPost._id}`);
      onDelete(localPost._id);
      addToast('Post deleted.', 'info');
    } catch { addToast('Failed to delete post', 'error'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await api.post(`/posts/${localPost._id}/comments`, { body: commentText });
      setLocalPost(p => ({ ...p, comments: [...(p.comments || []), res.data.comment] }));
      setCommentText('');
    } catch { addToast('Failed to post comment', 'error'); }
    finally { setSubmittingComment(false); }
  };

  const openInMaps = () => {
    const { latitude, longitude } = localPost.location;
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  return (
    <article className="post-card">
      <div className="post-inner">
        <header className="post-head">
          <Avatar name={localPost.username} size="lg" ring />
          <div className="post-ident">
            <div className="post-name">
              @{localPost.username}
              {localPost.mood && (
                <span className="mood-badge" title={`Feeling ${localPost.mood}`}>
                  <span>{MOOD_EMOJIS[localPost.mood] || '✨'}</span>{localPost.mood}
                </span>
              )}
            </div>
            <div className="post-meta">
              <span>{timeAgo(localPost.createdAt)}</span>
              {commentCount > 0 && (
                <>
                  <span className="dot" />
                  <span>{commentCount} {commentCount === 1 ? 'reply' : 'replies'}</span>
                </>
              )}
            </div>
          </div>
          {isOwner && (
            <button className="icon-btn sm act-danger" onClick={handleDelete} title="Delete post">
              <MdDeleteOutline size={19} />
            </button>
          )}
        </header>

        <h3 className="post-title">{localPost.title}</h3>
        <p className="post-body">{localPost.body}</p>

        {imageUrl && (
          <div className="post-media">
            <img src={imageUrl} alt="" loading="lazy" />
          </div>
        )}

        {localPost.location?.name && (
          <button className="post-location" onClick={openInMaps} title="Open in Google Maps">
            <MdLocationOn size={15} />
            <span>{localPost.location.name}</span>
            <MdNorthEast size={12} style={{ opacity: .6 }} />
          </button>
        )}

        {localPost.tags?.filter(Boolean).length > 0 && (
          <div className="post-tags">
            {localPost.tags.filter(Boolean).map(tag => (
              <button
                key={tag}
                className="tag"
                onClick={() => onTagClick && onTagClick(tag)}
                style={{ cursor: onTagClick ? 'pointer' : 'default' }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        <footer className="post-actions">
          <button
            className={`act ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <span className="a-ico">
              {isLiked ? <MdFavorite size={18} /> : <MdFavoriteBorder size={18} />}
            </span>
            <span>{localPost.reactions || 0}</span>
          </button>

          <button
            className={`act ${showComments ? 'open' : ''}`}
            onClick={() => setShowComments(v => !v)}
          >
            <span className="a-ico"><MdChatBubbleOutline size={17} /></span>
            <span>{commentCount}</span>
          </button>

          <button
            className={`act ${isSaved ? 'saved' : ''} act-spacer`}
            onClick={handleBookmark}
            title={isSaved ? 'Remove bookmark' : 'Save post'}
          >
            <span className="a-ico">
              {isSaved ? <MdBookmark size={18} /> : <MdBookmarkBorder size={18} />}
            </span>
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </footer>
      </div>

      {showComments && (
        <section className="comments">
          <div className="comments-label">
            {commentCount > 0 ? `${commentCount} comment${commentCount === 1 ? '' : 's'}` : 'Comments'}
          </div>

          {commentCount === 0 ? (
            <p className="no-comments">No comments yet — start the conversation.</p>
          ) : (
            localPost.comments.map((c, i) => (
              <div key={c._id || i} className="comment">
                <Avatar name={c.username} size="xs" />
                <div className="comment-bubble">
                  <div className="comment-author">@{c.username}</div>
                  <div className="comment-body">{c.body}</div>
                  <div className="comment-time">{timeAgo(c.createdAt)}</div>
                </div>
              </div>
            ))
          )}

          <form onSubmit={handleComment} className="comment-form">
            <Avatar name={user?.username} size="sm" />
            <input
              className="input"
              placeholder="Write a comment…"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              maxLength={500}
              aria-label="Write a comment"
            />
            <button
              type="submit"
              className="comment-send"
              disabled={submittingComment || !commentText.trim()}
              aria-label="Send comment"
            >
              {submittingComment ? <span className="spinner sm" /> : <MdSend size={17} />}
            </button>
          </form>
        </section>
      )}
    </article>
  );
}
