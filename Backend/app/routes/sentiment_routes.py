from flask import Blueprint, request, jsonify
from app.models.sentiment_model import generate_response
from app.config.settings import ALLOWED_ORIGINS
from flask_cors import CORS

# Create blueprint
bp = Blueprint('sentiment', __name__)

# Configure CORS for sentiment routes
CORS(bp, resources={
    r'/sentiment*': {
        'origins': ALLOWED_ORIGINS
    }
})

@bp.route('/sentiment', methods=['POST'])
def analyze_sentiment():
    """
    Analyze sentiment of text and generate appropriate response.
    """
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Text is required for sentiment analysis'}), 400
        
        # Analyze sentiment and generate response
        result = generate_response(text)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/sentiment/batch', methods=['POST'])
def analyze_sentiment_batch():
    """
    Analyze sentiment of multiple texts.
    """
    try:
        data = request.json
        texts = data.get('texts', [])
        
        if not texts or not isinstance(texts, list):
            return jsonify({'error': 'List of texts is required'}), 400
        
        if len(texts) > 10:
            return jsonify({'error': 'Maximum 10 texts allowed per batch'}), 400
        
        # Analyze each text
        results = []
        for text in texts:
            if text and isinstance(text, str):
                result = generate_response(text)
                results.append(result)
            else:
                results.append({
                    'input': text,
                    'error': 'Invalid text input'
                })
        
        return jsonify({
            'results': results,
            'total_analyzed': len(results)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
