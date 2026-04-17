# routes/auth.py
# Handles: POST /api/auth/register and POST /api/auth/login

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
# create_access_token generates a JWT token string
from werkzeug.security import generate_password_hash, check_password_hash
# generate_password_hash: scrambles a password so we never store it plain
# check_password_hash: checks if a plain password matches a stored hash
from models import db, User

# A Blueprint is like a mini Flask app — a group of related routes.
# 'auth' is just the name we give this blueprint internally.
auth_bp = Blueprint('auth', __name__)


# ─────────────────────────────────────────────
# REGISTER — POST /api/auth/register
# ─────────────────────────────────────────────
@auth_bp.route('/register', methods=['POST'])
def register():
    # request.get_json() reads the JSON body the frontend sent.
    # Example: {"name": "Miss Furina", "email": "f@school.com", "password": "abc123"}
    data = request.get_json()

    # --- Validate required fields ---
    required = ['name', 'email', 'password']
    for field in required:
        if not data or not data.get(field):
            # data.get(field) returns None if the key doesn't exist.
            # We return a 400 (Bad Request) error with a helpful message.
            return jsonify({'error': f'{field} is required'}), 400

    # --- Check email isn't already taken ---
    existing = User.query.filter_by(email=data['email']).first()
    # User.query = start a database query on the users table
    # .filter_by(email=...) = WHERE email = '...'
    # .first() = get the first result, or None if none found
    if existing:
        return jsonify({'error': 'Email already registered'}), 409
        # 409 = Conflict — the resource already exists

    # --- Create the new user ---
    hashed = generate_password_hash(data['password'])
    # NEVER store raw passwords. generate_password_hash turns
    # "abc123" into something like "pbkdf2:sha256:260000$x7K..."
    # It's a one-way transformation — cannot be reversed.

    user = User(
        name          = data['name'],
        email         = data['email'],
        password_hash = hashed
    )
    db.session.add(user)
    # db.session is like a shopping basket — you add items to it,
    # then commit (checkout) to save everything to the database at once.

    db.session.commit()
    # commit() executes the SQL INSERT and saves to the database.

    # --- Create a JWT token so they're logged in immediately ---
    token = create_access_token(identity=str(user.id))
    # identity is what gets stored inside the token.
    # We store the user's ID so we can look them up later.
    # str() converts integer to string — JWT requires a string.

    return jsonify({
        'message': 'Account created successfully',
        'token':   token,
        'user':    user.to_dict()
    }), 201
    # 201 = Created (resource was successfully created)


# ─────────────────────────────────────────────
# LOGIN — POST /api/auth/login
# ─────────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    # --- Find the user by email ---
    user = User.query.filter_by(email=data['email']).first()

    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401
        # 401 = Unauthorized
        # We say "email or password" (not "email not found") on purpose —
        # never reveal which one was wrong, for security.

    # --- Check the password ---
    if not check_password_hash(user.password_hash, data['password']):
        # check_password_hash hashes the submitted password the same way
        # and compares it to what's stored. Returns True or False.
        return jsonify({'error': 'Invalid email or password'}), 401

    # --- Issue a token ---
    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'token':   token,
        'user':    user.to_dict()
    }), 200
    # 200 = OK (the standard success response)