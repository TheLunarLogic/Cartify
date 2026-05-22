from flask import Blueprint, request, jsonify
from app.utils.db import get_mongo
from app.config.settings import ALLOWED_ORIGINS
from flask_cors import CORS
import pandas as pd
from app.config.settings import FINAL_FILE_PATH

# Create blueprint
bp = Blueprint('search', __name__)

# Catalog data for product search endpoints
catalog_df = pd.read_csv(FINAL_FILE_PATH)


def _normalize_text(value):
    return str(value or '').strip().lower()


def _rank_catalog_results(query, category='', min_price=0, max_price=float('inf'), limit=20):
    normalized_query = _normalize_text(query)
    query_tokens = [token for token in normalized_query.split() if token]

    if not query_tokens:
        return []

    filtered = catalog_df.copy()

    # ✅ STEP 1: Strict pre-filter (IMPORTANT FIX)
    mask = (
        filtered['productDisplayName'].astype(str).str.lower().str.contains(rf'\b{normalized_query}\b', na=False, regex=True)
        | filtered['articleType'].astype(str).str.lower().str.contains(rf'\b{normalized_query}\b', na=False, regex=True)
        | filtered['subCategory'].astype(str).str.lower().str.contains(rf'\b{normalized_query}\b', na=False, regex=True)
    )

    filtered = filtered[mask]

    # 👉 If no direct match, fallback to token search
    if filtered.empty:
        for token in query_tokens:
            filtered = catalog_df[
                catalog_df['productDisplayName'].astype(str).str.lower().str.contains(token, na=False)
            ]
            if not filtered.empty:
                break

    # ✅ Category filter
    if category:
        filtered = filtered[
            filtered['masterCategory'].astype(str).str.contains(category, case=False, na=False)
            | filtered['subCategory'].astype(str).str.contains(category, case=False, na=False)
            | filtered['articleType'].astype(str).str.contains(category, case=False, na=False)
        ]

    # ✅ Price filter
    if 'price' in filtered.columns:
        filtered = filtered[
            (filtered['price'] >= min_price) &
            (filtered['price'] <= max_price)
        ]

    # ✅ STEP 2: Improved scoring
    def _score_row(row):
        title = _normalize_text(row.get('productDisplayName'))
        article_type = _normalize_text(row.get('articleType'))

        score = 0

        # Exact match
        if normalized_query == title:
            score += 100

        # Startswith (strong signal)
        if title.startswith(normalized_query):
            score += 80

        # Token-based scoring
        for token in query_tokens:
            if token in title.split():
                score += 40
            if token in article_type.split():
                score += 30

        return score

    scored = filtered.assign(_score=filtered.apply(_score_row, axis=1))

    # ✅ Remove weak matches
    scored = scored[scored['_score'] >= 30]

    # Sort properly
    scored = scored.sort_values(by='_score', ascending=False)

    print(f"[SEARCH DEBUG] query='{query}', filtered={len(filtered)}, final={len(scored)}")

    return scored.head(limit).to_dict(orient='records')

# Configure CORS for search routes
CORS(bp, resources={
    r'/search*': {
        'origins': ALLOWED_ORIGINS
    }
})

@bp.route('/search', methods=['GET'])
def search():
    """
    General search endpoint.
    """
    try:
        query = request.args.get('q', '')
        category = request.args.get('category', '')
        limit = request.args.get('limit', 10, type=int)
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Check database connection
        mongo = get_mongo()
        if mongo is None or mongo.db is None:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # Search in products collection (if it exists)
        results = []
        
        # Search in customers collection
        customers = list(mongo.db.customers.find(
            {'id': {'$regex': query, '$options': 'i'}},
            {'id': 1, 'email': 1, '_id': 0}
        ).limit(limit))
        
        # Search in sellers collection
        sellers = list(mongo.db.sellers.find(
            {'id': {'$regex': query, '$options': 'i'}},
            {'id': 1, 'email': 1, '_id': 0}
        ).limit(limit))
        
        results = {
            'customers': customers,
            'sellers': sellers,
            'query': query,
            'total_found': len(customers) + len(sellers)
        }
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/search/products', methods=['GET'])
def search_products():
    """
    Search for products.
    """
    try:
        query = request.args.get('q', '')
        category = request.args.get('category', '')
        min_price = request.args.get('min_price', 0, type=float)
        max_price = request.args.get('max_price', float('inf'), type=float)
        limit = request.args.get('limit', 20, type=int)

        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        ranked_results = _rank_catalog_results(
            query=query,
            category=category,
            min_price=min_price,
            max_price=max_price,
            limit=limit
        )

        print(f"[GET /search/products] query='{query}', category='{category}', results={len(ranked_results)}")

        results = []
        for row in ranked_results:
            product_id = row.get('id')
            results.append({
                'id': int(product_id) if str(product_id).isdigit() else product_id,
                'name': row.get('productDisplayName', f'Product {product_id}'),
                'price': row.get('price', 0),
                'category': row.get('articleType') or row.get('subCategory') or 'Unknown',
                'link': row.get('link', ''),
                'metadata': {
                    'gender': row.get('gender', 'Unisex'),
                    'masterCategory': row.get('masterCategory', 'Apparel'),
                    'subCategory': row.get('subCategory', 'General'),
                    'articleType': row.get('articleType', ''),
                    'baseColour': row.get('baseColour', ''),
                    'season': row.get('season', ''),
                    'year': row.get('year', ''),
                    'usage': row.get('usage', ''),
                }
            })

        return jsonify({
            'results': results,
            'query': query,
            'total_found': len(results),
            'message': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
