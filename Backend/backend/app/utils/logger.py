"""
Centralized structured logger for the Alumni Network backend.

Usage:
    from app.utils.logger import get_logger
    logger = get_logger(__name__)
    logger.info("Something happened")
    logger.warning("Watch out")
    logger.error("Something failed", exc_info=True)
"""
import logging
import sys

from app.config.settings import settings

# Log level from environment (default INFO)
_LOG_LEVEL = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

# Shared formatter
_FORMATTER = logging.Formatter(
    fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Root handler (stdout)
_handler = logging.StreamHandler(sys.stdout)
_handler.setFormatter(_FORMATTER)
_handler.setLevel(_LOG_LEVEL)


def get_logger(name: str) -> logging.Logger:
    """Return a named logger configured with the shared formatter and level."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.addHandler(_handler)
    logger.setLevel(_LOG_LEVEL)
    logger.propagate = False
    return logger
