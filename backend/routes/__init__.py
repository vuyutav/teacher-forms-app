# routes/__init__.py
# This file turns the routes/ folder into a Python "package"
# and gives Flask a single place to import all route groups.

from .auth      import auth_bp
from .forms     import forms_bp
from .responses import responses_bp

# These are "blueprints" — Flask's way of grouping related routes.
# We import them here so app.py only needs one import.