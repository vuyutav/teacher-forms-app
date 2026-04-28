# app.py — Final version
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    JWTManager(app)
    # JWTManager handles all JWT token creation and validation.
    # Once initialized, you can use @jwt_required() on any route.

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints — this connects our route files to the app.
    # url_prefix means every route in auth_bp starts with /api/auth
    from routes import auth_bp, forms_bp, responses_bp
    app.register_blueprint(auth_bp,      url_prefix='/api/auth')
    app.register_blueprint(forms_bp,     url_prefix='/api')
    app.register_blueprint(responses_bp, url_prefix='/api')

    @app.route('/')
    def index():
        return jsonify({"message": "Welcome to Furina's Form by Ibrahim API!"})

    @app.route('/api/health')
    def health():
        return jsonify({"status": "Furina's form by Ibrahim is open!", "version": "1.0"})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)