from flask import Blueprint, request, jsonify
from app.utils.db import get_mongo
from app.config.settings import ALLOWED_ORIGINS
from flask_cors import CORS

# Create blueprint
bp = Blueprint('login', __name__)

# Configure CORS for login routes
CORS(bp, resources={
    r'/login*': {
        'origins': ALLOWED_ORIGINS
    }
})

@bp.route('/login', methods=['POST'])
def login():
    """
    Handle user login.
    """
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        user_type = data.get('user_type', 'customer')  # 'customer' or 'seller'
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Check database connection
        mongo = get_mongo()
        if not mongo or not mongo.db:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # Check user in appropriate collection
        collection_name = 'customers' if user_type == 'customer' else 'sellers'
        user = mongo.db[collection_name].find_one({
            'id': username,
            'password': password  # In production, use proper password hashing
        })
        
        if user:
            return jsonify({
                'message': 'Login successful',
                'username': username,
                'user_type': user_type,
                'user_id': str(user['_id'])
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/register', methods=['POST'])
def register():
    """
    Handle user registration.
    """
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        user_type = data.get('user_type', 'customer')  # 'customer' or 'seller'
        
        if not username or not password or not email:
            return jsonify({'error': 'Username, password, and email are required'}), 400
        
        # Check database connection
        mongo = get_mongo()
        if not mongo or not mongo.db:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # Check if user already exists
        collection_name = 'customers' if user_type == 'customer' else 'sellers'
        existing_user = mongo.db[collection_name].find_one({'id': username})
        
        if existing_user:
            return jsonify({'error': 'Username already exists'}), 409
        
        # Create new user
        user_data = {
            'id': username,
            'password': password,  # In production, use proper password hashing
            'email': email,
            'created_at': mongo.db.command('serverStatus')['localTime']
        }
        
        result = mongo.db[collection_name].insert_one(user_data)
        
        return jsonify({
            'message': 'Registration successful',
            'username': username,
            'user_type': user_type,
            'user_id': str(result.inserted_id)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
