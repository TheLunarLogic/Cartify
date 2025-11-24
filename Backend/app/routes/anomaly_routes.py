from flask import Blueprint, request, jsonify
import os
from sklearn.metrics.pairwise import cosine_similarity
from app.models.anomaly_model import extract_features, calculate_ssim

# Create blueprint
bp = Blueprint('anomaly', __name__)

@bp.route('/upload', methods=['POST'])
def upload_images():
    """
    Upload and compare two images for anomaly detection.
    """
    try:
        # Check if images are provided
        if 'image1' not in request.files or 'image2' not in request.files:
            return jsonify({'error': 'No images provided'}), 400
        
        # Get the uploaded files
        image1 = request.files['image1']
        image2 = request.files['image2']
        
        # Save images temporarily
        image1_path = 'image1.jpg'
        image2_path = 'image2.jpg'
        
        image1.save(image1_path)
        image2.save(image2_path)
        
        # Extract features from both images
        features1 = extract_features(image1_path)
        features2 = extract_features(image2_path)
        
        # Check if feature extraction was successful
        if features1 is None or features2 is None:
            return jsonify({
                'error': 'Image analysis features are not available. Please install required ML dependencies.',
                'similarity_score': 0.0,
                'ssim_similarity': 0.0,
                'final_similarity': 0.0,
                'decision': '❌ Analysis not available - Install ML dependencies'
            }), 200
        
        # Calculate cosine similarity
        similarity_cosine = cosine_similarity([features1], [features2])[0][0]
        
        # Calculate SSIM similarity
        similarity_ssim = calculate_ssim(image1_path, image2_path)
        
        # Calculate final similarity score (weighted combination)
        final_similarity = 0.7 * similarity_cosine + 0.3 * similarity_ssim
        
        # Make decision based on similarity score
        if final_similarity > 0.85:
            decision = '✅ Match Confirmed'
        elif final_similarity > 0.6:
            decision = '⚠️ Review Needed'
        else:
            decision = '❌ Possible Anomaly - Reupload Required'
        
        # Clean up temporary files
        os.remove(image1_path)
        os.remove(image2_path)
        
        return jsonify({
            'similarity_score': float(similarity_cosine),
            'ssim_similarity': float(similarity_ssim),
            'final_similarity': float(final_similarity),
            'decision': decision
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
