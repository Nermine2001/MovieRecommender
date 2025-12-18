// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;
const IA_SERVICE_URL = 'http://ia-service:8000';

app.use(cors());
app.use(express.json());

// Base de données simulée de films
const moviesDB = [
  { id: 1, title: "Inception", genre: "Sci-Fi", rating: 8.8, year: 2010 },
  { id: 2, title: "The Matrix", genre: "Sci-Fi", rating: 8.7, year: 1999 },
  { id: 3, title: "Interstellar", genre: "Sci-Fi", rating: 8.6, year: 2014 },
  { id: 4, title: "The Godfather", genre: "Crime", rating: 9.2, year: 1972 },
  { id: 5, title: "Pulp Fiction", genre: "Crime", rating: 8.9, year: 1994 },
  { id: 6, title: "The Dark Knight", genre: "Action", rating: 9.0, year: 2008 },
  { id: 7, title: "Forrest Gump", genre: "Drama", rating: 8.8, year: 1994 },
  { id: 8, title: "The Shawshank Redemption", genre: "Drama", rating: 9.3, year: 1994 },
  { id: 9, title: "Fight Club", genre: "Drama", rating: 8.8, year: 1999 },
  { id: 10, title: "Goodfellas", genre: "Crime", rating: 8.7, year: 1990 },
  { id: 11, title: "Avatar", genre: "Sci-Fi", rating: 7.8, year: 2009 },
  { id: 12, title: "Gladiator", genre: "Action", rating: 8.5, year: 2000 },
  { id: 13, title: "The Lord of the Rings: The Fellowship of the Ring", genre: "Fantasy", rating: 8.8, year: 2001 },
  { id: 14, title: "The Lord of the Rings: The Two Towers", genre: "Fantasy", rating: 8.7, year: 2002 },
  { id: 15, title: "The Lord of the Rings: The Return of the King", genre: "Fantasy", rating: 8.9, year: 2003 },
  { id: 16, title: "Star Wars: Episode IV - A New Hope", genre: "Sci-Fi", rating: 8.7, year: 1977 },
  { id: 17, title: "Star Wars: Episode V - The Empire Strikes Back", genre: "Sci-Fi", rating: 8.8, year: 1980 },
  { id: 18, title: "Star Wars: Episode VI - Return of the Jedi", genre: "Sci-Fi", rating: 8.7, year: 1983 },
  { id: 19, title: "Star Wars: Episode V - The Empire Strikes Back", genre: "Sci-Fi", rating: 8.8, year: 1980 },
  // adding more movies without repeating the exixting movies
];

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'backend' });
});

// Recherche de films
app.get('/api/movies/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  
  const results = moviesDB.filter(movie => 
    movie.title.toLowerCase().includes(query) ||
    movie.genre.toLowerCase().includes(query)
  );
  
  res.json(results);
});

// Obtenir tous les films
app.get('/api/movies', (req, res) => {
  res.json(moviesDB);
});

// Obtenir un film par ID
app.get('/api/movies/:id', (req, res) => {
  const movie = moviesDB.find(m => m.id === parseInt(req.params.id));
  
  if (!movie) {
    return res.status(404).json({ error: 'Film non trouvé' });
  }
  
  res.json(movie);
});

// Obtenir des recommandations depuis le service IA
app.get('/api/recommendations/:movieId', async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId);
    const movie = moviesDB.find(m => m.id === movieId);
    
    if (!movie) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    // Appeler le service IA
    const response = await axios.post(`${IA_SERVICE_URL}/recommend`, {
      movie_id: movieId,
      movie_genre: movie.genre,
      movie_rating: movie.rating,
      all_movies: moviesDB
    });

    res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération des recommandations:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des recommandations',
      details: error.message 
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend démarré sur le port ${PORT}`);
});