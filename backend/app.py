# app.py — production-ready version
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    JWTManager(app)

    # Read allowed origins from environment variable.
    # In development: * (allow all)
    # In production: only your Vercel URL
    allowed_origins = os.getenv('ALLOWED_ORIGINS', '*')
    # os.getenv returns the value of ALLOWED_ORIGINS from .env
    # If not set, defaults to '*' so local dev still works

    CORS(app, resources={
        r"/api/*": {
            "origins": allowed_origins.split(',')
            # .split(',') converts "url1,url2" string into ["url1","url2"] list
            # This lets you allow multiple origins if needed
        }
    })

    from routes import auth_bp, forms_bp, responses_bp
    app.register_blueprint(auth_bp,      url_prefix='/api/auth')
    app.register_blueprint(forms_bp,     url_prefix='/api')
    app.register_blueprint(responses_bp, url_prefix='/api')

    @app.route('/api/health')
    def health():
        return jsonify({"status": "Furina's court is open!", "version": "1.0"})

    return app

if __name__ == '__main__':
    app = create_app()
    # In production Render runs gunicorn, not this line.
    # This only runs locally.
    app.run(debug=False, port=5000)