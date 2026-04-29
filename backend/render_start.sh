#!/bin/bash
# render_start.sh
# Render.com runs this script to start your Flask app.
# We use gunicorn instead of "python app.py" because gunicorn
# can handle multiple users simultaneously — python app.py can only
# handle one request at a time (fine for dev, bad for production).

gunicorn "app:create_app()" \
  --bind 0.0.0.0:$PORT \
  --workers 2 \
  --timeout 120
# "app:create_app()" means: in app.py, call the create_app() function
# --bind 0.0.0.0:$PORT — Render provides the PORT variable automatically
# --workers 2 — two parallel worker processes (good for free tier)
# --timeout 120 — kill a request if it takes longer than 2 minutes