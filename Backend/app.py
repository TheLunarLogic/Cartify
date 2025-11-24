"""
Main Flask application entry point.
"""

from app import create_app
import os

# Create the Flask application
app = create_app()

# For Vercel deployment
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
