"""
Backward-compatibility shim.
All new code should import from app.config.settings directly.
"""
from app.config.settings import settings  # noqa: F401

__all__ = ["settings"]
