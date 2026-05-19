import { useState, useEffect } from 'react';
import { articles as articlesApi } from '../../services/api';
import './Pages.css';

export default function JournalPage() {
  const [dbArticles, setDbArticles] = useState([]);

  useEffect(() => {
    articlesApi.getAll().then(({ ok, data }) => {
      if (ok && Array.isArray(data)) setDbArticles(data);
    });
  }, []);

  const staticArticles = [
    {
      id: 1,
      title: "The Art of Identifying True First Editions",
      tag: "CURATION",
      date: "October 12, 2024",
      readTime: "6 min read",
      excerpt: "Understanding the subtle differences between print runs, dust jacket variations, and publisher markings that signify a true first edition.",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: 2,
      title: "Preserving Your Personal Library",
      tag: "CONSERVATION",
      date: "September 28, 2024",
      readTime: "8 min read",
      excerpt: "Expert advice on climate control, handling, and shelving techniques to ensure your rare books maintain their condition for generations.",
      image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: 3,
      title: "The Renaissance of Bookbinding",
      tag: "CRAFTSMANSHIP",
      date: "September 15, 2024",
      readTime: "5 min read",
      excerpt: "A look inside the workshops of modern master bookbinders who are keeping the ancient craft of leather tooling and gilding alive.",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: 4,
      title: "The Philosophy of Collecting Philosophy",
      tag: "COLLECTING",
      date: "August 30, 2024",
      readTime: "7 min read",
      excerpt: "Why first edition philosophy books from Nietzsche, Kant, and Sartre hold a unique place in the hearts of elite collectors globally.",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: 5,
      title: "A Walk Through Literary History: The Lost Manuscripts",
      tag: "HISTORY",
      date: "August 10, 2024",
      readTime: "10 min read",
      excerpt: "Exploring historical documents that were lost to time, only to be rediscovered in the most unexpected attics and monastery vaults.",
      image: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: 6,
      title: "Curating a Modern Library: Classics Meets Contemporary",
      tag: "LIFESTYLE",
      date: "July 24, 2024",
      readTime: "6 min read",
      excerpt: "A comprehensive guide on balancing timeless 19th-century antiquarian leather-bound volumes with striking 21st-century modern classics.",
      image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600"
    }
  ];

  const displayArticles = dbArticles.length > 0
    ? dbArticles.map(a => ({
        id: a.id,
        title: a.title,
        tag: a.tag,
        date: a.date,
        readTime: a.readTime,
        excerpt: a.excerpt,
        image: a.imageUrl || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600'
      }))
    : staticArticles;

  return (
    <div className="premium-page-container">
      <div className="page-glow"></div>
      <div className="page-content animate-slide-up" style={{ maxWidth: '1200px', width: '100%' }}>
        <h1 className="page-title gradient-text">The Journal</h1>
        <p className="page-subtitle">Insights, editorials, and guides from the world of premium literary curation and library art.</p>
        
        <div className="journal-grid">
          {displayArticles.map((article) => (
            <div key={article.id} className="journal-card">
              <div className="journal-img-wrapper">
                <img src={article.image} alt={article.title} className="journal-img" />
                <span className="journal-tag">{article.tag}</span>
              </div>
              <div className="journal-body">
                <div className="journal-meta">
                  <span className="journal-date">{article.date}</span>
                  <span className="journal-readtime">{article.readTime}</span>
                </div>
                <h3 className="journal-title">{article.title}</h3>
                <p className="journal-excerpt">{article.excerpt}</p>
                <a href={`/journal/${article.id}`} className="journal-link" onClick={(e) => e.preventDefault()}>
                  Read Article 
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px' }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
