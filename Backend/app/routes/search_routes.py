from flask import Blueprint, request, jsonify
from app.utils.db import get_mongo
from app.config.settings import ALLOWED_ORIGINS
from flask_cors import CORS

# Create blueprint
bp = Blueprint('search', __name__)

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
        if not mongo or not mongo.db:
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
        
        # This would typically search in a products collection
        # For now, return a placeholder response
        return jsonify({
            'results': [],
            'query': query,
            'total_found': 0,
            'message': 'Product search not implemented yet'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
