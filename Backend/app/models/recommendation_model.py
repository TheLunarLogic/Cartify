try:
    import torch
    import torch.nn as nn
    import torchvision.transforms as transforms
    from torchvision import models
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

from io import BytesIO
import pandas as pd
from app.config.settings import RECOMMEND_DATA_PATH

# Load the recommendation data
df = pd.read_csv(RECOMMEND_DATA_PATH)

# Load pre-trained ResNet50 model
if TORCH_AVAILABLE:
    model = models.resnet50(pretrained=True)
    model = nn.Sequential(*list(model.children())[:-1])
    model.eval()

    # Define image preprocessing transforms
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
else:
    model = None
    transform = None

def extract_features(image_file):
    """
    Extract features from an image using ResNet50.
    
    Args:
        image_file: File-like object containing the image data
        
    Returns:
        Normalized feature vector
    """
    if not TORCH_AVAILABLE or not PIL_AVAILABLE or not NUMPY_AVAILABLE:
        return None
    
    if model is None or transform is None:
        return None
    
    try:
        # Open and preprocess the image
        img = Image.open(BytesIO(image_file.read())).convert('RGB')
        img = transform(img).unsqueeze(0)
        
        # Extract features
        with torch.no_grad():
            features = model(img)
        
        # Flatten and normalize features
        features = features.view(-1).numpy()
        features = features / np.linalg.norm(features)
        
        return features
    except Exception:
        return None

def get_link_by_id(index):
    """
    Get the link for a product by its ID.
    
    Args:
        index: Product ID
        
    Returns:
        Product link or None if not found
    """
    result = df[df['id'] == index]['link']
    if not result.empty:
        return result.values[0]
    return None
