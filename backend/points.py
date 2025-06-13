from fastapi import HTTPException, APIRouter
import os
from src.db import sb


class PointsAction:
    SIGNUP = 10
    ADD_LISTING = 50
    ADD_COMMENT = 30
    ADD_RATING = 20
    COMPLETE_TRANSACTION = 90

router = APIRouter(tags=["points"])

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


@router.get('/points/leaderboard')
async def get_leaderboard():
    """
    Get a leaderboard of users and their points, sorted by points in descending order
    """
    try:
        # Include avatar_url in the select statement
        result = sb.from_('profiles').select('id, full_name, points, avatar_url').order('points', desc=True).execute()

        if not result.data:
            return []

        # Format the response with avatar URL transformation
        leaderboard = []
        for user in result.data:
            # Convert avatar URL to public URL if it exists
            avatar_url = None
            if user.get('avatar_url'):
                public_avatars_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public"
                avatar_path = user['avatar_url']
                avatar_url = f"{public_avatars_url}/{avatar_path}"

            leaderboard.append({
                'user_id': user['id'],
                'full_name': user['full_name'],
                'points': user['points'],
                'avatar_url': avatar_url
            })

        return leaderboard

    except Exception as e:
        print(f"Error fetching leaderboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch leaderboard")