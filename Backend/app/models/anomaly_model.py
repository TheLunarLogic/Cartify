try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    from tensorflow.keras.applications import ResNet50
    from tensorflow.keras.applications.resnet50 import preprocess_input
    from tensorflow.keras.preprocessing.image import load_img, img_to_array
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False

try:
    from skimage.metrics import structural_similarity as ssim
    SKIMAGE_AVAILABLE = True
except ImportError:
    SKIMAGE_AVAILABLE = False

# Load pre-trained ResNet50 model
if TENSORFLOW_AVAILABLE:
    model = ResNet50(weights='imagenet', include_top=False, pooling='avg')
else:
    model = None

def enhance_image(image_path):
    """
    Enhance image quality for better feature extraction.
    
    Args:
        image_path: Path to the input image
        
    Returns:
        Enhanced image array
    """
    if not CV2_AVAILABLE:
        return None
    
    try:
        # Read the image
        image = cv2.imread(image_path)
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply histogram equalization
        enhanced = cv2.equalizeHist(gray)
        
        # Apply Gaussian blur
        blurred = cv2.GaussianBlur(enhanced, (5, 5), 0)
        
        # Merge channels
        enhanced_image = cv2.merge([blurred, blurred, blurred])
        
        return enhanced_image
    except Exception:
        return None

def extract_features(image_path):
    """
    Extract features from an image using ResNet50.
    
    Args:
        image_path: Path to the input image
        
    Returns:
        Flattened feature vector
    """
    if not all([TENSORFLOW_AVAILABLE, CV2_AVAILABLE, NUMPY_AVAILABLE]) or model is None:
        return None
    
    try:
        # Enhance the image
        enhanced_img = enhance_image(image_path)
        if enhanced_img is None:
            return None
        
        # Save enhanced image temporarily
        cv2.imwrite('enhanced.jpg', enhanced_img)
        
        # Load and preprocess the image
        image = load_img('enhanced.jpg', target_size=(224, 224))
        image_array = img_to_array(image)
        image_array = np.expand_dims(image_array, axis=0)
        processed_image = preprocess_input(image_array)
        
        # Extract features
        features = model.predict(processed_image)
        return features.flatten()
        
    except Exception as e:
        print('Error in extract_features:', str(e))
        return None

def calculate_ssim(image1_path, image2_path):
    """
    Calculate Structural Similarity Index between two images.
    
    Args:
        image1_path: Path to the first image
        image2_path: Path to the second image
        
    Returns:
        SSIM score between 0 and 1
    """
    if not all([CV2_AVAILABLE, SKIMAGE_AVAILABLE]):
        return 0.0
    
    try:
        # Read images in grayscale
        img1 = cv2.imread(image1_path, cv2.IMREAD_GRAYSCALE)
        img2 = cv2.imread(image2_path, cv2.IMREAD_GRAYSCALE)
        
        if img1 is None or img2 is None:
            return 0.0
        
        # Resize images to same size
        img1 = cv2.resize(img1, (224, 224))
        img2 = cv2.resize(img2, (224, 224))
        
        # Calculate SSIM
        score, _ = ssim(img1, img2, full=True)
        return score
    except Exception:
        return 0.0
