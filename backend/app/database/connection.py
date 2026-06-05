# pyrefly: ignore [missing-import]
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
from app.config.settings import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class Database:
    client: AsyncIOMotorClient = None
    db = None


db_instance = Database()


def connect_to_mongo() -> None:
    """
    Initialize the Motor async MongoDB client.

    Supports both:
      - Local MongoDB:  mongodb://localhost:27017
      - MongoDB Atlas:  mongodb+srv://<user>:<pass>@cluster.mongodb.net/
    """
    db_instance.client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        # Fail fast if the server is unreachable (especially useful in production)
        serverSelectionTimeoutMS=10_000,
        connectTimeoutMS=10_000,
        socketTimeoutMS=30_000,
        # Atlas requires TLS; local MongoDB ignores these gracefully
        tls=settings.MONGODB_URL.startswith("mongodb+srv"),
        retryWrites=True,
    )
    db_instance.db = db_instance.client[settings.DATABASE_NAME]
    logger.info(
        "MongoDB client initialised | db=%s | env=%s",
        settings.DATABASE_NAME,
        settings.APP_ENV,
    )


def close_mongo_connection() -> None:
    """Close the Motor client gracefully on shutdown."""
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed")


def get_database():
    """Return the active Motor database handle."""
    return db_instance.db


def get_collection(name: str):
    """Return a Motor collection, auto-connecting if not yet initialised."""
    if db_instance.db is None:
        connect_to_mongo()
    return db_instance.db[name]


async def create_indexes() -> None:
    """
    Create all required MongoDB indexes on startup.
    Safe to call repeatedly — MongoDB is idempotent on existing indexes.

    Indexes created:
      - users.email         → unique (login lookup, duplicate prevention)
      - profiles.user_id    → unique (one profile per user)
      - activities.user_id  → fast activity history
      - recommendations     → compound (user_id ASC, timestamp DESC)
    """
    db = get_database()
    if db is None:
        logger.warning("create_indexes called before MongoDB was connected – skipping")
        return

    try:
        await db["users"].create_index("email", unique=True, background=True)
        await db["profiles"].create_index("user_id", unique=True, background=True)
        await db["activities"].create_index("user_id", background=True)
        await db["recommendations"].create_index(
            [("user_id", ASCENDING), ("timestamp", DESCENDING)],
            background=True,
        )
        logger.info("MongoDB indexes verified/created successfully")
    except Exception as exc:
        logger.error("Failed to create MongoDB indexes: %s", exc, exc_info=True)


async def ping_database() -> bool:
    """
    Send a lightweight ping to MongoDB.
    Returns True if reachable, False otherwise.
    Used by the /health endpoint.
    """
    try:
        if db_instance.client is None:
            return False
        await db_instance.client.admin.command("ping")
        return True
    except Exception as exc:
        logger.warning("Database ping failed: %s", exc)
        return False
