"""
Admin Router — Protected admin-only operations.

Endpoints:
  POST /api/admin/seed  — Wipe and re-seed the database with demo profiles.
                          Requires the admin secret key in the header.

WARNING: This endpoint deletes all data. Only expose in demo/staging environments.
"""
from fastapi import APIRouter, Header, HTTPException, status
from app.config.settings import settings
from app.utils.responses import success_response, error_response
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post(
    "/seed",
    summary="Reseed the database with demo data",
    description=(
        "**Admin only.** Wipes all existing users, profiles, activities, and recommendations, "
        "then seeds 20 realistic demo profiles. "
        "Pass the JWT secret key in the `X-Admin-Key` header to authorize.\n\n"
        "⚠️ Use only for demo resets — this deletes all current data."
    ),
)
async def seed_demo_data(x_admin_key: str = Header(..., description="Admin secret key")):
    """Reset the database to the demo state."""
    if x_admin_key != settings.JWT_SECRET_KEY:
        logger.warning("Unauthorized admin seed attempt")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin key",
        )

    try:
        # Import here to avoid circular imports and keep startup fast
        import asyncio
        from app.utils.seed_data import seed
        await seed(clear_existing=True)
        logger.info("Admin seed completed successfully")
        return success_response(
            message="Database seeded successfully with 20 demo profiles",
            data={"profiles_seeded": 20},
        )
    except Exception as exc:
        logger.error("Admin seed failed: %s", exc, exc_info=True)
        return error_response(
            message=f"Seeding failed: {str(exc)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
