import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiStar } from 'react-icons/fi';
import { reviewsAPI } from '../services/api';
import toast from 'react-hot-toast';

const StarRating = ({ value, size = 'md' }) => {
  const v = Math.min(5, Math.max(0, value || 0));
  const sizeClass = size === 'lg' ? 'text-2xl' : 'text-sm';
  return (
    <div className={`flex gap-0.5 ${sizeClass} text-amber-500`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <FiStar key={i} className={i <= v ? 'fill-current' : ''} />
      ))}
    </div>
  );
};

const ReviewsSection = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: '', customerName: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await reviewsAPI.getReviews(0, 10);
        const list = res?.content ?? res ?? [];
        if (!cancelled) setReviews(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating < 1 || form.rating > 5) {
      toast.error('Please select a rating (1–5 stars).');
      return;
    }
    setSubmitting(true);
    try {
      await reviewsAPI.createReview({
        rating: form.rating,
        comment: form.comment.trim() || null,
        customerName: form.customerName.trim() || null,
      });
      toast.success('Thank you for your review!');
      setForm({ rating: 5, comment: '', customerName: '' });
      const res = await reviewsAPI.getReviews(0, 10);
      const list = res?.content ?? res ?? [];
      setReviews(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err?.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section id="reviews" className="relative py-20 persian-pattern-bg dark:bg-mono-800">
      <div className="persian-corners max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="persian-corner-bl" aria-hidden />
        <div className="persian-corner-br" aria-hidden />
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-mono-900 dark:text-mono-100 mb-4 persian-section-title">
            {t('reviews.title', 'Reviews & Ratings')}
          </h2>
          <span className="persian-title-band" aria-hidden />
          {avgRating && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <StarRating value={parseFloat(avgRating)} size="lg" />
              <span className="text-lg font-semibold text-mono-700 dark:text-mono-300">
                {avgRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="font-display text-xl font-bold text-mono-900 dark:text-mono-100 mb-4">
              {t('reviews.submitTitle', 'Leave a review')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-mono-700 dark:text-mono-300 mb-2">
                  Rating (1–5 stars) *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, rating: r }))}
                      className={`p-2 rounded transition ${form.rating >= r ? 'text-amber-500' : 'text-mono-300 hover:text-amber-400'}`}
                    >
                      <FiStar className={form.rating >= r ? 'fill-current' : ''} size={24} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-mono-700 dark:text-mono-300 mb-1">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-mono-200 dark:border-mono-600 rounded-sm bg-white dark:bg-mono-700 text-mono-900 dark:text-mono-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mono-700 dark:text-mono-300 mb-1">
                  Comment (optional)
                </label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="Share your experience..."
                  rows={3}
                  className="w-full px-4 py-2 border border-mono-200 dark:border-mono-600 rounded-sm bg-white dark:bg-mono-700 text-mono-900 dark:text-mono-100"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-mono-800 dark:bg-mono-600 text-white rounded-sm font-medium hover:bg-mono-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit review'}
              </button>
            </form>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold text-mono-900 dark:text-mono-100 mb-4">
              {t('reviews.recentTitle', 'Recent reviews')}
            </h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-sm border border-mono-200 dark:border-mono-600 animate-pulse">
                    <div className="h-4 w-1/3 bg-mono-200 dark:bg-mono-600 rounded mb-2" />
                    <div className="h-3 w-full bg-mono-100 dark:bg-mono-700 rounded" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-mono-600 dark:text-mono-400">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-sm border border-mono-200 dark:border-mono-600 bg-white dark:bg-mono-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <StarRating value={r.rating} />
                      <span className="text-sm text-mono-500">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    {r.customerName && (
                      <p className="font-medium text-mono-800 dark:text-mono-200 text-sm mb-1">
                        {r.customerName}
                      </p>
                    )}
                    {r.comment && (
                      <p className="text-mono-600 dark:text-mono-400 text-sm">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
