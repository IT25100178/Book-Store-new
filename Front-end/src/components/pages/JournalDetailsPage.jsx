import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articles as articlesApi } from '../../services/api';
import './Pages.css';

export default function JournalDetailsPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    articlesApi.getById(id).then(({ ok, data }) => {
      if (ok) {
        setArticle(data);
      } else {
        setError('Article not found.');
      }
      setLoading(false);
    }).catch(() => {
      setError('An error occurred while fetching the article.');
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="premium-page-container">
        <div className="page-glow"></div>
        <div className="page-content animate-slide-up" style={{ textAlign: 'center', padding: '6rem 0' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 2rem' }}></div>
          <p style={{ color: 'rgba(240, 230, 211, 0.6)' }}>Delving into archives...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="premium-page-container">
        <div className="page-glow"></div>
        <div className="page-content animate-slide-up" style={{ textAlign: 'center', padding: '6rem 0' }}>
          <h2 style={{ color: '#f87171', marginBottom: '1.5rem' }}>{error || 'Article Not Found'}</h2>
          <Link to="/journal" className="back-to-journal-btn">
            ← Back to The Journal
          </Link>
        </div>
      </div>
    );
  }

  const paragraphs = article.content ? article.content.split('\n').filter(p => p.trim() !== '') : [];

  return (
    <div className="premium-page-container">
      <div className="page-glow"></div>
      <div className="page-content animate-slide-up" style={{ maxWidth: '800px', width: '100%' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <Link to="/journal" className="back-to-journal-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Journal
          </Link>
        </div>

        <div className="article-header">
          <span className="journal-tag" style={{ position: 'static', display: 'inline-block', marginBottom: '1.5rem' }}>
            {article.tag}
          </span>
          <h1 className="article-details-title" style={{ fontSize: '3rem', fontWeight: '500', color: '#fff', lineHeight: '1.2', marginBottom: '1.5rem', fontFamily: "'Playfair Display', serif" }}>
            {article.title}
          </h1>
          <div className="article-meta" style={{ display: 'flex', gap: '2rem', color: 'rgba(240, 230, 211, 0.5)', fontSize: '0.9rem', borderBottom: '1px solid rgba(212, 175, 55, 0.15)', paddingBottom: '1.5rem', marginBottom: '2.5rem' }}>
            <span>📅 {article.date}</span>
            <span>⏱️ {article.readTime}</span>
          </div>
        </div>

        <div className="article-hero-wrapper" style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.2)', marginBottom: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <img 
            src={article.imageUrl || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=1200'} 
            alt={article.title} 
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', maxHeight: '450px' }}
          />
        </div>

        <div className="article-body">
          {article.excerpt && (
            <div className="article-excerpt-callout" style={{ 
              fontSize: '1.2rem', 
              fontStyle: 'italic', 
              color: '#D4AF37', 
              borderLeft: '4px solid #8B0000', 
              paddingLeft: '1.5rem', 
              marginBottom: '2.5rem', 
              lineHeight: '1.6',
              background: 'rgba(212, 175, 55, 0.03)',
              padding: '1.5rem'
            }}>
              {article.excerpt}
            </div>
          )}

          <div className="article-content-paragraphs" style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'rgba(240, 230, 211, 0.8)' }}>
            {paragraphs.map((p, idx) => (
              <p key={idx} style={{ marginBottom: '1.75rem' }}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
