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
from app.config.settings import RECOMMEND_DATA_PATH, FINAL_FILE_PATH

# Load product datasets
recommend_df = pd.read_csv(RECOMMEND_DATA_PATH)
catalog_df = pd.read_csv(FINAL_FILE_PATH)


def _normalize_product_id(product_id):
    """Normalize product IDs to integer when possible."""
    try:
        return int(product_id)
    except (TypeError, ValueError):
        return None


# Build ID-indexed caches for fast and stable lookups.
catalog_by_id = {}
for _, row in catalog_df.iterrows():
    normalized_id = _normalize_product_id(row.get('id'))
    if normalized_id is not None:
        catalog_by_id[normalized_id] = row.to_dict()

link_by_id = {}
for _, row in recommend_df.iterrows():
    normalized_id = _normalize_product_id(row.get('id'))
    if normalized_id is not None:
        link_by_id[normalized_id] = row.get('link')

# Ensure links are also available from catalog when present.
for pid, row in catalog_by_id.items():
    if pid not in link_by_id and row.get('link'):
        link_by_id[pid] = row.get('link')

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


def _extract_dominant_rgb(image_file):
    """
    Extract approximate dominant RGB for coarse visual similarity fallback.
    """
    if not PIL_AVAILABLE or not NUMPY_AVAILABLE:
        return None

    try:
        img = Image.open(BytesIO(image_file.read())).convert('RGB').resize((64, 64))
        arr = np.array(img).reshape(-1, 3)
        return arr.mean(axis=0)
    except Exception:
        return None


def _color_distance(rgb_a, rgb_b):
    if rgb_a is None or rgb_b is None:
        return float("inf")
    return float(np.linalg.norm(rgb_a - rgb_b))


def _build_color_rgb_map():
    return {
        'black': np.array([20, 20, 20]),
        'white': np.array([235, 235, 235]),
        'grey': np.array([128, 128, 128]),
        'gray': np.array([128, 128, 128]),
        'blue': np.array([70, 110, 190]),
        'navy': np.array([25, 45, 100]),
        'red': np.array([190, 60, 60]),
        'maroon': np.array([120, 35, 45]),
        'green': np.array([70, 140, 75]),
        'olive': np.array([95, 100, 35]),
        'yellow': np.array([220, 190, 70]),
        'orange': np.array([220, 130, 45]),
        'pink': np.array([215, 145, 175]),
        'purple': np.array([120, 85, 150]),
        'brown': np.array([120, 85, 60]),
        'beige': np.array([205, 185, 155]),
        'cream': np.array([230, 220, 190]),
        'gold': np.array([200, 170, 85]),
        'silver': np.array([185, 185, 195]),
    }


COLOR_RGB_MAP = _build_color_rgb_map()


def recommend_product_ids(image_file, num_recommendations=5):
    """
    Return product IDs with stable, deterministic mapping.
    Uses dominant-color matching as a fallback when no vector index is available.
    """
    target_rgb = _extract_dominant_rgb(image_file)
    if target_rgb is None:
        return list(catalog_by_id.keys())[:num_recommendations]

    scored_rows = []
    for pid, row in catalog_by_id.items():
        base_colour = str(row.get('baseColour', '')).strip().lower()
        color_rgb = None
        for color_name, rgb in COLOR_RGB_MAP.items():
            if color_name in base_colour:
                color_rgb = rgb
                break

        # Unknown colors are penalized but still eligible.
        score = _color_distance(target_rgb, color_rgb) if color_rgb is not None else 9999.0
        scored_rows.append((score, pid))

    scored_rows.sort(key=lambda item: item[0])
    return [pid for _, pid in scored_rows[:num_recommendations]]


def get_product_by_id(product_id):
    """
    Return full product metadata by ID with normalized ID handling.
    """
    normalized_id = _normalize_product_id(product_id)
    if normalized_id is None:
        return None

    row = catalog_by_id.get(normalized_id)
    if row is None:
        return None

    result = dict(row)
    result['id'] = normalized_id
    result['link'] = link_by_id.get(normalized_id) or row.get('link')
    return result

def get_link_by_id(index):
    """
    Get the link for a product by its ID.
    
    Args:
        index: Product ID
        
    Returns:
        Product link or None if not found
    """
    normalized_id = _normalize_product_id(index)
    if normalized_id is None:
        return None
    return link_by_id.get(normalized_id)
