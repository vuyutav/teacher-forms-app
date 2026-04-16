# config.py
# This file holds all configuration settings for Flask.
# By putting config in a separate file, we keep app.py clean.

import os
from dotenv import load_dotenv

# load_dotenv() reads your .env file and makes all the
# variables available via os.getenv()
load_dotenv()

class Config:
    # os.getenv looks for the variable name in your .env file
    # The second argument is a fallback value if it's not found

    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    # This is the Supabase connection string we saved earlier

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Disables a Flask-SQLAlchemy feature we don't need.
    # Keeping it True wastes memory and shows a warning.

    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback-secret')
    # Used to sign JWT login tokens.
    # If JWT_SECRET_KEY isn't in .env, uses 'fallback-secret' (dev only)