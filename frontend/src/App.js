// frontend/src/App.js
import React, { useState } from 'react';
import './style.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/movies/search?q=${searchQuery}`);
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const getRecommendations = async (movieId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/recommendations/${movieId}`);
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎬 MovieRec</h1>
        <p>Trouvez votre prochain film préféré</p>
      </header>

      <div className="container">
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher un film..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchMovies()}
            />
            <button onClick={searchMovies} disabled={loading}>
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>

          {movies.length > 0 && (
            <div className="movies-grid">
              {movies.map((movie) => (
                <div key={movie.id} className="movie-card">
                  <div className="movie-poster">
                    <span className="movie-icon">🎥</span>
                  </div>
                  <h3>{movie.title}</h3>
                  <p className="movie-genre">{movie.genre}</p>
                  <p className="movie-rating">⭐ {movie.rating}/10</p>
                  <button 
                    className="btn-recommend"
                    onClick={() => getRecommendations(movie.id)}
                  >
                    Recommandations
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {recommendations.length > 0 && (
          <div className="recommendations-section">
            <h2>Recommandations pour vous</h2>
            <div className="recommendations-grid">
              {recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="rec-icon">🎭</div>
                  <h3>{rec.title}</h3>
                  <p>{rec.genre}</p>
                  <div className="rec-score">
                    Score: {rec.similarity_score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;