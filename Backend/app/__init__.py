"""
Main application package.
"""

from flask import Flask
from flask_cors import CORS
from app.utils.db import init_db
from app.config.settings import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    CORS(app)
    init_db(app)
    
    # Import routes
    from app.routes import (
        anomaly_routes,
        chatbot_routes,
        login_routes,
        recommendation_routes,
        search_routes,
        sentiment_routes
    )
    
    # Register blueprints
    app.register_blueprint(anomaly_routes.bp)
    app.register_blueprint(chatbot_routes.bp)
    app.register_blueprint(login_routes.bp)
    app.register_blueprint(recommendation_routes.bp)
    app.register_blueprint(search_routes.bp)
    app.register_blueprint(sentiment_routes.bp)
    
    return app
