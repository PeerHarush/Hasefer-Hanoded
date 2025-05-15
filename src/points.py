from fastapi import HTTPException
from src.db import sb


class PointsAction:
    SIGNUP = 10
    ADD_LISTING = 50
    ADD_TO_WISHLIST = 20
    ADD_COMMENT = 30
    ADD_RATING = 20
    COMPLETE_TRANSACTION = 90 


async def award_points(user_id: str, points: int) -> None:
    """
    Add points to a user's profile using RPC
    """
    try:
        # Call the database function via RPC
        sb.rpc('add_points', {
            'user_id': user_id,
            'points_to_add': points
        }).execute()

    except Exception as e:
        print(f"Error awarding points: {str(e)}")
        # Don't fail the main operation if points award fails
        pass