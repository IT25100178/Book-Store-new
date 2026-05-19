import React, { useState, useEffect } from 'react';
import { authors as authorsApi } from '../../services/api';
import AboutSection from './AboutSection';
import './AboutUs.css';

export default function AboutUs() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuthors() {
      const res = await authorsApi.getAll();
      if (res.ok) setAuthors(res.data);
      setLoading(false);
    }
    loadAuthors();
  }, []);

  return (
    <div className="about-page-container">
      {/* ── New Animated Premium About Section ── */}
      <AboutSection />

      <div className="about-hero">
        <h1 className="about-title">Our Heritage</h1>
        <p className="about-subtitle">Preserving the magic of rare, first-edition literature and bringing the world's most luxurious stories into the hands of true collectors.</p>
      </div>

      <div className="about-story-section">
        <div className="story-content">
          <h2>The Luxury Books Legacy</h2>
          <p>Founded in 1924, Luxury Books began as a small, intimate parlor for intellectuals and literary enthusiasts in the heart of London. Today, we have evolved into the premier destination for discovering unparalleled literary treasures.</p>
          <p>Our curation process is meticulous. Every page, every spine, and every binding is inspected by our master archivists. We believe that a book is not merely a story, but an artifact of human history.</p>
        </div>
        <div className="story-image">
          <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80" alt="Library" />
        </div>
      </div>

      <div className="about-team-section">
        <h2 className="team-title">Meet Our Master Archivists & Authors</h2>
        <div className="team-grid">
          {loading ? (
            <div className="loading-authors">Loading profiles...</div>
          ) : authors.length > 0 ? (
            authors.map(author => (
              <div key={author.id} className="author-card">
                <div className="author-img-wrap">
                  <img src={author.imageUrl || 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&q=80'} alt={author.name} />
                </div>
                <h3>{author.name}</h3>
                <span className="author-role">{author.role}</span>
                <p className="author-bio">{author.bio}</p>
              </div>
            ))
          ) : (
            <div className="empty-authors">No featured profiles found. Admin can add them in the dashboard!</div>
          )}
        </div>
      </div>
    </div>
  );
}
