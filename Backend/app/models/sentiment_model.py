try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
    # Initialize sentiment analysis pipeline
    classifier = pipeline('sentiment-analysis', framework='pt')
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    classifier = None

def generate_response(text):
    """
    Generate a response based on sentiment analysis of the input text.
    
    Args:
        text: Input text to analyze
        
    Returns:
        Dictionary containing input, sentiment, confidence, and response
    """
    if not TRANSFORMERS_AVAILABLE or classifier is None:
        return {
            'input': text,
            'sentiment': 'NEUTRAL',
            'confidence': 0.5,
            'response': 'Sentiment analysis is not available. Please install required dependencies.'
        }
    
    try:
        # Analyze sentiment
        result = classifier([text])[0]
        sentiment = result['label']
        confidence = result['score']
    except Exception:
        return {
            'input': text,
            'sentiment': 'NEUTRAL',
            'confidence': 0.5,
            'response': 'Error analyzing sentiment.'
        }
    
    # Generate response based on sentiment and confidence
    if sentiment == 'POSITIVE':
        if confidence >= 0.9:
            response = 'Thank you so much, come again!'
        elif confidence >= 0.7:
            response = 'Great to hear that! We appreciate your support!'
        else:
            response = 'Thanks for your feedback!'
    else:
        if confidence >= 0.9:
            response = "Sorry for the inconvenience, we will correct it. You won't face this again."
        elif confidence >= 0.4:
            response = "We're sorry you didn't have the best experience. Let us know how we can improve!"
        else:
            response = "We sincerely apologize for the issue. We'll ensure it doesn't happen again."
    
    return {
        'input': text,
        'sentiment': sentiment,
        'confidence': confidence,
        'response': response
    }
