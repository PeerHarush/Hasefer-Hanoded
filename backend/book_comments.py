from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel, conint
import os

from src.db import sb
from src.auth import get_current_user
from src.points import award_points, PointsAction

router = APIRouter(tags=["book-comments"])


class CommentCreate(BaseModel):
    comment_text: str
    rating: conint(ge=0, le=5)  # Ensures rating is between 0 and 5


class CommentUpdate(BaseModel):
    comment_text: Optional[str] = None
    rating: Optional[conint(ge=0, le=5)] = None


@router.get('/books/{book_id}/comments')
async def get_book_comments(book_id: str):
    """Get all comments for a specific book"""
    try:
        # First get all comments
        comments_result = sb.from_('book_comments') \
            .select('*') \
            .eq('book_id', book_id) \
            .order('created_at.desc') \
            .execute()

        comments = comments_result.data
        formatted_comments = []

        # Then get user details for each comment
        for comment in comments:
            # Get user profile
            user_result = sb.from_('profiles') \
                .select('id, full_name, avatar_url') \
                .eq('id', comment['user_id']) \
                .single() \
                .execute()

            user_data = user_result.data if user_result.data else {}

            # Convert avatar URL to public URL if it exists
            if user_data and user_data.get('avatar_url'):
                public_avatars_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public"
                avatar_path = user_data['avatar_url']
                user_data['avatar_url'] = f"{public_avatars_url}/{avatar_path}"

            formatted_comment = {
                'id': comment['id'],
                'created_at': comment['created_at'],
                'updated_at': comment['updated_at'],
                'comment_text': comment['comment_text'],
                'rating': comment['rating'],
                'user': user_data
            }
            formatted_comments.append(formatted_comment)

        return formatted_comments

    except Exception as e:
        print(f"Error in get_book_comments: {str(e)}")  # Debug print
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/books/{book_id}/comments/user')
async def get_user_comments(book_id: str, user=Depends(get_current_user)):
    """Get all comments by the current user for a specific book"""
    try:
        result = sb.from_('book_comments').select(
            'id, created_at, updated_at, comment_text, rating'
        ).eq('book_id', book_id).eq('user_id', user.id).execute()

        return result.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/books/{book_id}/comments')
async def create_comment(
        book_id: str,
        comment_data: CommentCreate,
        user=Depends(get_current_user)
):
    """Create a new comment for a book"""
    try:
        # Check if book exists
        book_result = sb.from_('books').select('id').eq('id', book_id).single().execute()
        if not book_result.data:
            raise HTTPException(status_code=404, detail="Book not found")

        # Create the comment
        comment = {
            'user_id': user.id,
            'book_id': book_id,
            'comment_text': comment_data.comment_text,
            'rating': comment_data.rating
        }

        result = sb.from_('book_comments').insert(comment).execute()

        # Award points for both comment and rating
        await award_points(user.id, PointsAction.ADD_COMMENT)
        await award_points(user.id, PointsAction.ADD_RATING)

        return result.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put('/comments/{comment_id}')
async def update_comment(
        comment_id: str,
        comment_data: CommentUpdate,
        user=Depends(get_current_user)
):
    """Update a specific comment"""
    try:
        # Check if comment exists and belongs to the user
        existing = sb.from_('book_comments').select('id').eq('id', comment_id).eq('user_id', user.id).single().execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Comment not found or you don't have permission to edit it")

        # Build update data
        updates = {}
        if comment_data.comment_text is not None:
            updates['comment_text'] = comment_data.comment_text
        if comment_data.rating is not None:
            updates['rating'] = comment_data.rating

        if not updates:
            raise HTTPException(status_code=400, detail="No valid fields provided for update")

        result = sb.from_('book_comments').update(
            updates
        ).eq('id', comment_id).eq('user_id', user.id).execute()

        return result.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete('/comments/{comment_id}')
async def delete_comment(comment_id: str, user=Depends(get_current_user)):
    """Delete a specific comment"""
    try:
        result = sb.from_('book_comments').delete().eq('id', comment_id).eq('user_id', user.id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Comment not found or you don't have permission to delete it")

        return {'message': 'Comment deleted successfully'}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Create a new endpoint to get the latest 10 comments in the system
@router.get('/comments/latest')
async def get_latest_comments():
    """Get the latest 10 comments in the system"""
    try:
        result = sb.from_('book_comments') \
            .select('id, book_id, comment_text, rating, created_at, user_id') \
            .order('created_at.desc') \
            .limit(10) \
            .execute()

        comments = result.data
        formatted_comments = []

        for comment in comments:
            # Get user profile
            user_result = sb.from_('profiles') \
                .select('id, full_name, avatar_url') \
                .eq('id', comment['user_id']) \
                .single() \
                .execute()

            user_data = user_result.data if user_result.data else {}

            # Convert avatar URL to public URL if it exists
            if user_data and user_data.get('avatar_url'):
                public_avatars_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public"
                avatar_path = user_data['avatar_url']
                user_data['avatar_url'] = f"{public_avatars_url}/{avatar_path}"

            formatted_comment = {
                'id': comment['id'],
                'book_id': comment['book_id'],
                'comment_text': comment['comment_text'],
                'rating': comment['rating'],
                'created_at': comment['created_at'],
                'user': user_data
            }
            formatted_comments.append(formatted_comment)

        return formatted_comments

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
