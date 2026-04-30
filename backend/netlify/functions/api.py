# netlify/functions/api.py
# Netlify looks for Python functions inside netlify/functions/.
# This file is the entry point Netlify calls for every API request.
# It imports the handler we created in app.py and exposes it here.

import sys
import os

# Add the backend root to Python's path so it can find app.py,
# models.py, routes/, etc. Without this, the import below fails
# because Netlify runs this file from a different working directory.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)
))))
# os.path.abspath(__file__)  → full path to this file
# os.path.dirname × 3        → goes up 3 levels to /backend

from app import handler
# handler is the Mangum-wrapped Flask app from app.py.
# Netlify calls handler() automatically for every incoming request.