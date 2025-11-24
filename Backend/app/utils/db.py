from flask_pymongo import PyMongo
from app.config.settings import Config
from pymongo.errors import ConfigurationError

# Global mongo instance
mongo = None

def init_db(app):
    """
    Initialize MongoDB connection for the Flask app.
    
    Args:
        app: Flask application instance
    """
    global mongo
    
    # Get MongoDB URI from app config
    uri = app.config.get('MONGO_URI')
    
    if not uri:
        print('MongoDB not configured; skipping database initialization.')
        mongo = None
        return
    
    try:
        # Initialize PyMongo
        mongo = PyMongo()
        mongo.init_app(app, uri=uri)
        
        # Test the connection
        with app.app_context():
            mongo.db.command('ping')
            print('MongoDB connection established successfully!')
            
        return mongo
        
    except ConfigurationError as error:
        print('MongoDB configuration error:', error, '. Skipping database initialization.')
        mongo = None
        return
        
    except Exception as error:
        print('MongoDB initialization failed:', error, '. Skipping database initialization.')
        print('Please check your MongoDB URI and ensure the database is accessible.')
        mongo = None
        return

def get_mongo():
    """Get the MongoDB instance."""
    return mongo
