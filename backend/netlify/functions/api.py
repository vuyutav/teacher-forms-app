import sys
from pathlib import Path

# Add backend root to Python path
backend_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_root))

# Import Mangum-wrapped handler from app.py
from app import handler