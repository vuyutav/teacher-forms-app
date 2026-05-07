import sys
from pathlib import Path

backend_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_root))

from app import handler