# app.py
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

    allowed_origins = os.getenv('ALLOWED_ORIGINS', '*')
    CORS(app, resources={
        r"/api/*": {
            "origins": allowed_origins.split(',')
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

# This is what Netlify calls instead of gunicorn.
# Mangum wraps your Flask app so Netlify's serverless
# runtime can talk to it using the standard ASGI/WSGI interface.
app = create_app()


# Local development still works the same way
if __name__ == '__main__':
    app.run(debug=True, port=5000)
    
from mangum import Mangum
handler = Mangum(app)