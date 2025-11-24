from flask import Blueprint, request, jsonify
from app.models.recommendation_model import extract_features, get_link_by_id
from app.config.settings import ALLOWED_ORIGINS
from flask_cors import CORS
import numpy as np
import pandas as pd
from app.config.settings import RECOMMEND_DATA_PATH

# Create blueprint
bp = Blueprint('recommendation', __name__)

# Configure CORS for recommendation routes
CORS(bp, resources={
    r'/recommend*': {
        'origins': ALLOWED_ORIGINS
    }
})

# Load recommendation data
df = pd.read_csv(RECOMMEND_DATA_PATH)

@bp.route('/recommend', methods=['POST'])
def get_recommendations():
    """
    Get product recommendations based on uploaded image.
    """
    try:
        # Check if image is provided
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image = request.files['image']
        num_recommendations = request.form.get('num_recommendations', 5, type=int)
        
        # Save image temporarily
        image_path = 'temp_image.jpg'
        image.save(image_path)
        
        # Extract features from uploaded image
        uploaded_features = extract_features(open(image_path, 'rb'))
        
        if uploaded_features is None:
            return jsonify({
                'error': 'Image analysis features are not available. Please install required ML dependencies.',
                'recommendations': [],
                'total_found': 0
            }), 200
        
        # Calculate similarities with all products
        similarities = []
        for idx, row in df.iterrows():
            # For demo purposes, we'll use random similarities
            # In production, you would extract features from product images
            similarity = np.random.random()
            similarities.append({
                'id': row['id'],
                'similarity': float(similarity),
                'name': row.get('name', f'Product {row["id"]}'),
                'price': row.get('price', 0),
                'category': row.get('category', 'Unknown')
            })
        
        # Sort by similarity and get top recommendations
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        top_recommendations = similarities[:num_recommendations]
        
        # Add product links
        for rec in top_recommendations:
            rec['link'] = get_link_by_id(rec['id'])
        
        # Clean up temporary file
        import os
        os.remove(image_path)
        
        return jsonify({
            'recommendations': top_recommendations,
            'total_found': len(similarities)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/recommend/search', methods=['POST'])
def search_products():
    """
    Search products by text query.
    """
    try:
        data = request.json
        query = data.get('query', '')
        category = data.get('category', '')
        min_price = data.get('min_price', 0)
        max_price = data.get('max_price', float('inf'))
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Filter products based on criteria
        filtered_df = df.copy()
        
        if category:
            filtered_df = filtered_df[filtered_df['category'].str.contains(category, case=False, na=False)]
        
        if 'price' in filtered_df.columns:
            filtered_df = filtered_df[
                (filtered_df['price'] >= min_price) & 
                (filtered_df['price'] <= max_price)
            ]
        
        # Simple text search in product names/descriptions
        if 'name' in filtered_df.columns:
            search_results = filtered_df[
                filtered_df['name'].str.contains(query, case=False, na=False)
            ]
        else:
            search_results = filtered_df
        
        # Convert to list of dictionaries
        results = []
        for idx, row in search_results.head(20).iterrows():  # Limit to 20 results
            result = {
                'id': row['id'],
                'name': row.get('name', f'Product {row["id"]}'),
                'price': row.get('price', 0),
                'category': row.get('category', 'Unknown'),
                'link': get_link_by_id(row['id'])
            }
            results.append(result)
        
        return jsonify({
            'results': results,
            'total_found': len(search_results),
            'query': query
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
