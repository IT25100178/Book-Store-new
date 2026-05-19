import { useState, useEffect } from 'react';
import { authors as authorsApi } from '../../services/api';
import './Pages.css';

export default function AuthorsDirectory() {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    authorsApi.getAll().then(({ ok, data }) => {
      if (ok && Array.isArray(data)) setAuthors(data);
    });
  }, []);

  const displayAuthors = authors.length > 0 ? authors : [
    { 
      id: 1, 
      name: 'F. Scott Fitzgerald', 
      timeline: '1896 – 1940',
      role: 'Classic Literature', 
      quote: '“Show me a hero and I\'ll write you a tragedy.”',
      bio: 'Francis Scott Key Fitzgerald was an American novelist, essayist, and screenwriter. He is best known for his novels depicting the flamboyance and excess of the Jazz Age—a term which he popularized.', 
      imageUrl: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&q=80&w=400',
      masterpiece: 'The Great Gatsby'
    },
    { 
      id: 2, 
      name: 'George Orwell', 
      timeline: '1903 – 1950',
      role: 'Political Satire & Dystopian', 
      quote: '“In a time of deceit telling the truth is a revolutionary act.”',
      bio: 'Eric Arthur Blair, known by his pen name George Orwell, was an English novelist, essayist, journalist, and critic. His work is characterized by lucid prose, biting social criticism, and opposition to totalitarianism.', 
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400',
      masterpiece: '1984 & Animal Farm'
    },
    { 
      id: 3, 
      name: 'Jane Austen', 
      timeline: '1775 – 1817',
      role: 'Romantic Realism', 
      quote: '“There is no charm equal to tenderness of heart.”',
      bio: 'Jane Austen was an English novelist known primarily for her six major novels, which interpret, critique and comment upon the British landed gentry at the end of the 18th century.', 
      imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
      masterpiece: 'Pride and Prejudice'
    },
    { 
      id: 4, 
      name: 'Virginia Woolf', 
      timeline: '1882 – 1941',
      role: 'Modernist Literature', 
      quote: '“No need to hurry. No need to sparkle. No need to be anybody but oneself.”',
      bio: 'Virginia Woolf was an English writer, considered one of the most important modernist 20th-century authors and a pioneer in the use of stream of consciousness as a narrative device.', 
      imageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400',
      masterpiece: 'Mrs Dalloway & To the Lighthouse'
    },
    { 
      id: 5, 
      name: 'Ernest Hemingway', 
      timeline: '1899 – 1961',
      role: 'Modern Realism', 
      quote: '“There is no friend as loyal as a book.”',
      bio: 'Ernest Miller Hemingway was an American novelist, short-story writer, and journalist. His economical and understated style had a strong influence on 20th-century fiction.', 
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
      masterpiece: 'The Old Man and the Sea'
    },
    { 
      id: 6, 
      name: 'J.R.R. Tolkien', 
      timeline: '1892 – 1973',
      role: 'High Fantasy', 
      quote: '“Not all those who wander are lost.”',
      bio: 'John Ronald Reuel Tolkien was an English writer, poet, philologist, and academic, best known as the author of the high fantasy works that shaped the modern fantasy genre.', 
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
      masterpiece: 'The Lord of the Rings'
    }
  ];

  return (
    <div className="premium-page-container">
      <div className="page-glow"></div>
      <div className="page-content animate-slide-up" style={{ maxWidth: '1200px', width: '100%' }}>
        <h1 className="page-title gradient-text">Authors Directory</h1>
        <p className="page-subtitle">Discover the brilliant minds behind our luxury collection of rare literature.</p>
        
        <div className="authors-grid">
          {displayAuthors.map(author => (
            <div key={author.id} className="author-card">
              <div className="author-img-wrapper">
                <div className="author-img-ring"></div>
                <img 
                  src={author.imageUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400'} 
                  alt={author.name} 
                  className="author-img" 
                />
              </div>
              <h2 className="author-name">{author.name}</h2>
              <span className="author-timeline">{author.timeline || '19th Century'}</span>
              <span className="author-role">{author.role}</span>
              {author.quote && <p className="author-quote">{author.quote}</p>}
              <p className="author-bio">{author.bio}</p>
              {author.masterpiece && (
                <div className="author-masterpiece">
                  Signature Masterpiece
                  <span>{author.masterpiece}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
