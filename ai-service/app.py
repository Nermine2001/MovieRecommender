# ia-service/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)
CORS(app)

class SimpleRecommender:
    """Système de recommandation basé sur la similarité cosinus"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.genre_mapping = {
            'Sci-Fi': 0,
            'Crime': 1,
            'Action': 2,
            'Drama': 3
        }
    
    def encode_genre(self, genre):
        """Encode le genre en valeur numérique"""
        return self.genre_mapping.get(genre, 0)
    
    def create_feature_vector(self, movie):
        """Crée un vecteur de caractéristiques pour un film"""
        return np.array([
            self.encode_genre(movie['genre']),
            movie['rating'],
            movie['year'] / 2024.0  # Normalisation de l'année
        ])
    
    def get_recommendations(self, target_movie, all_movies, top_n=5):
        """Génère des recommandations basées sur la similarité"""
        
        # Créer les vecteurs de caractéristiques
        target_vector = self.create_feature_vector(target_movie).reshape(1, -1)
        
        movie_vectors = []
        movie_list = []
        
        for movie in all_movies:
            if movie['id'] != target_movie['id']:
                movie_vectors.append(self.create_feature_vector(movie))
                movie_list.append(movie)
        
        if not movie_vectors:
            return []
        
        movie_vectors = np.array(movie_vectors)
        
        # Calculer la similarité cosinus
        similarities = cosine_similarity(target_vector, movie_vectors)[0]
        
        # Obtenir les indices des films les plus similaires
        top_indices = np.argsort(similarities)[::-1][:top_n]
        
        # Créer les recommandations
        recommendations = []
        for idx in top_indices:
            movie = movie_list[idx]
            similarity_score = int(similarities[idx] * 100)
            
            recommendations.append({
                'id': movie['id'],
                'title': movie['title'],
                'genre': movie['genre'],
                'rating': movie['rating'],
                'year': movie['year'],
                'similarity_score': similarity_score
            })
        
        return recommendations

# Initialiser le recommender
recommender = SimpleRecommender()

@app.route('/health', methods=['GET'])
def health():
    """Route de santé"""
    return jsonify({
        'status': 'healthy',
        'service': 'ia-service',
        'model': 'cosine_similarity_recommender'
    })

@app.route('/recommend', methods=['POST'])
def recommend():
    """Génère des recommandations de films"""
    try:
        data = request.json
        
        movie_id = data.get('movie_id')
        movie_genre = data.get('movie_genre')
        movie_rating = data.get('movie_rating')
        all_movies = data.get('all_movies', [])
        
        if not all_movies:
            return jsonify({'error': 'Aucun film fourni'}), 400
        
        # Trouver le film cible
        target_movie = next((m for m in all_movies if m['id'] == movie_id), None)
        
        if not target_movie:
            return jsonify({'error': 'Film cible non trouvé'}), 404
        
        # Générer les recommandations
        recommendations = recommender.get_recommendations(
            target_movie, 
            all_movies, 
            top_n=5
        )
        
        return jsonify(recommendations)
    
    except Exception as e:
        return jsonify({
            'error': 'Erreur lors de la génération des recommandations',
            'details': str(e)
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Informations sur le modèle"""
    return jsonify({
        'model_type': 'Content-Based Filtering',
        'algorithm': 'Cosine Similarity',
        'features': ['genre', 'rating', 'year'],
        'description': 'Recommande des films similaires basés sur les caractéristiques'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)