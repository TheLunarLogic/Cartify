from flask import Blueprint, request, jsonify
from app.models.recommendation_model import (
    extract_features,
    get_link_by_id,
    recommend_product_ids,
)
from app.config.settings import ALLOWED_ORIGINS
from flask_cors import CORS
import pandas as pd
from app.config.settings import RECOMMEND_DATA_PATH, FINAL_FILE_PATH

# Create blueprint
bp = Blueprint('recommendation', __name__)

# Configure CORS for recommendation routes
CORS(bp, resources={
    r'/recommend*': {
        'origins': ALLOWED_ORIGINS
    },
    r'/get_data*': {
        'origins': ALLOWED_ORIGINS
    }
})

# Load datasets for recommendation + search
recommend_df = pd.read_csv(RECOMMEND_DATA_PATH)
catalog_df = pd.read_csv(FINAL_FILE_PATH)


def _normalize_text(value):
    return str(value or '').strip().lower()


def _to_product_payload(row, fallback_article_type=''):
    product_id = row.get('id')
    return {
        'id': int(product_id) if str(product_id).isdigit() else product_id,
        'link': row.get('link') or get_link_by_id(product_id) or '',
        'productDisplayName': row.get('productDisplayName') or row.get('name') or f'Product {product_id}',
        'articleType': row.get('articleType', fallback_article_type),
        'baseColour': row.get('baseColour', 'N/A'),
        'gender': row.get('gender', 'Unisex'),
        'masterCategory': row.get('masterCategory', 'Apparel'),
        'season': row.get('season', 'All Seasons'),
        'subCategory': row.get('subCategory', 'General'),
        'usage': row.get('usage', 'Casual'),
        'year': int(row.get('year', 2024)) if str(row.get('year', '')).isdigit() else 2024,
    }


def _search_catalog(query, limit=50, category='', min_price=0, max_price=float('inf')):
    normalized_query = _normalize_text(query)
    if not normalized_query:
        return []

    query_tokens = [token for token in normalized_query.split() if token]
    if not query_tokens:
        return []

    filtered = catalog_df.copy()

    if category:
        filtered = filtered[
            filtered['masterCategory'].astype(str).str.contains(category, case=False, na=False)
            | filtered['subCategory'].astype(str).str.contains(category, case=False, na=False)
            | filtered['articleType'].astype(str).str.contains(category, case=False, na=False)
        ]

    if 'price' in filtered.columns:
        filtered = filtered[
            (filtered['price'] >= min_price) &
            (filtered['price'] <= max_price)
        ]

    def _score_row(row):
        title = _normalize_text(row.get('productDisplayName'))
        article_type = _normalize_text(row.get('articleType'))
        sub_category = _normalize_text(row.get('subCategory'))
        master_category = _normalize_text(row.get('masterCategory'))
        base_colour = _normalize_text(row.get('baseColour'))
        usage = _normalize_text(row.get('usage'))

        search_blob = " ".join([
            title, article_type, sub_category, master_category, base_colour, usage
        ])
        if not search_blob:
            return 0

        score = 0
        if normalized_query == article_type:
            score += 120
        if normalized_query == title:
            score += 140
        if title.startswith(normalized_query):
            score += 60
        if article_type.startswith(normalized_query):
            score += 70

        for token in query_tokens:
            if token in title:
                score += 25
            if token in article_type:
                score += 30
            if token in sub_category:
                score += 15
            if token in master_category:
                score += 12
            if token in base_colour:
                score += 10
            if token in usage:
                score += 8

        return score

    filtered = filtered.assign(_score=filtered.apply(_score_row, axis=1))
    matched = filtered[filtered['_score'] > 0].sort_values(by='_score', ascending=False)
    return matched.head(limit).to_dict(orient='records')

@bp.route('/recommend', methods=['POST'])
def get_recommendations():
    """
    Get product recommendations based on uploaded image.
    """
    try:
        print('[POST /recommend] Request received')

        # Accept both keys for compatibility with frontend variants.
        image = request.files.get('image') or request.files.get('file')
        if image is None:
            return jsonify({'error': 'No image provided'}), 400

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
        
        # Stable recommendation IDs from model/fallback logic.
        with open(image_path, 'rb') as img_file:
            recommended_ids = recommend_product_ids(img_file, num_recommendations)
        print(f"[POST /recommend] Recommended IDs: {recommended_ids}")

        top_recommendations = []
        matched_ids = []
        for pid in recommended_ids:
            product_row = catalog_df[catalog_df['id'] == pid]
            if product_row.empty:
                # Handle type mismatch safely (e.g., int vs string IDs).
                product_row = catalog_df[catalog_df['id'].astype(str) == str(pid)]

            if product_row.empty:
                continue

            row = product_row.iloc[0]
            product_id = row.get('id')
            product_link = row.get('link') or get_link_by_id(product_id) or ''

            top_recommendations.append({
                'id': int(product_id) if str(product_id).isdigit() else product_id,
                'similarity': None,
                'name': row.get('productDisplayName') or f'Product {product_id}',
                'price': row.get('price', 0),
                'category': row.get('articleType') or row.get('subCategory') or 'Unknown',
                'link': product_link
            })
            matched_ids.append(product_id)
        
        # Clean up temporary file
        import os
        os.remove(image_path)
        
        response_payload = {
            'recommendations': top_recommendations,
            'recommended_numbers': [rec['id'] for rec in top_recommendations],
            'recommended_links': [rec['link'] for rec in top_recommendations],
            'total_found': len(top_recommendations)
        }
        print(f"[POST /recommend] Matched IDs: {matched_ids}")
        print(f"[POST /recommend] Returning {len(top_recommendations)} recommendations")
        return jsonify(response_payload)
        
    except Exception as e:
        print(f'[POST /recommend] Error: {e}')
        return jsonify({'error': str(e)}), 500

@bp.route('/get_data', methods=['POST'])
def get_data():
    """
    Compatibility endpoint used by frontend search modal.
    Expected payload: { "articleType": "<text>" }
    """
    try:
        data = request.get_json(silent=True) or {}
        article_type = (data.get('articleType') or '').strip()
        print(f"[POST /get_data] articleType='{article_type}'")

        if not article_type:
            return jsonify({'error': 'articleType is required'}), 400

        limit = min(max(data.get('limit', 50), 1), 200)
        matches = _search_catalog(article_type, limit=limit)
        results = [_to_product_payload(row, fallback_article_type=article_type) for row in matches]

        print(f"[POST /get_data] Returning {len(results)} products")
        return jsonify(results)
    except Exception as e:
        print(f'[POST /get_data] Error: {e}')
        return jsonify({'error': str(e)}), 500

@bp.route('/recommend/search', methods=['POST'])
def search_products():
    """
    Search products by text query.
    """
    try:
        data = request.get_json(silent=True) or {}
        query = data.get('query', '')
        category = data.get('category', '')
        min_price = data.get('min_price', 0)
        max_price = data.get('max_price', float('inf'))
        limit = min(max(int(data.get('limit', 50)), 1), 200)
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        print(f"[POST /recommend/search] query='{query}', category='{category}', limit={limit}")
        search_results = _search_catalog(
            query=query,
            category=category,
            min_price=min_price,
            max_price=max_price,
            limit=limit
        )

        results = []
        for row in search_results:
            product = _to_product_payload(row, fallback_article_type=query)
            results.append({
                'id': product['id'],
                'name': product['productDisplayName'],
                'price': row.get('price', 0),
                'category': product['articleType'] or product['subCategory'],
                'link': product['link'],
                'metadata': product
            })
        
        return jsonify({
            'results': results,
            'total_found': len(search_results),
            'query': query
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
