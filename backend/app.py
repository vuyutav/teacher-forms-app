# app.py
# This is the main entry point for the Flask application.
# It creates the app, loads config, registers routes, and starts the server.

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db

def create_app():
    # create_app() is a "factory function" — it builds and returns
    # the Flask app. This pattern makes testing easier later.

    app = Flask(__name__)

    # Load all settings from config.py
    app.config.from_object(Config)

    # Initialize the database with this app
    # db.init_app() links the SQLAlchemy instance to our Flask app
    db.init_app(app)

    # Enable CORS — Cross-Origin Resource Sharing.
    # Without this, your Next.js frontend (localhost:3000) would be
    # BLOCKED from calling your Flask API (localhost:5000) by the browser.
    # Browsers block requests between different ports/domains by default
    # for security. CORS tells Flask to allow it.
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    # r"/api/*" = only allow CORS on routes starting with /api/
    # origins="*" = allow from any domain (we'll restrict this in production)

    # Health check route — useful to verify the API is running
    @app.route('/api/health')
    def health():
        return jsonify({
            "status": "Furina's court is open!",
            "version": "1.0"
        })

    return app

# Only runs when you execute: python app.py
# Not when imported by another file
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)