from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import os

from src.db import sb
from src.auth import get_current_user
from src.points import award_points, PointsAction

router = APIRouter(tags=["wishlist"])


@router.get('/wishlist')
async def get_wishlist(user=Depends(get_current_user)):
    """Get the current user's wishlist with book details and listing availability"""
    try:
        # Get user's wishlist items joined with books
        result = sb.from_('wishlists').select(
            'book_id'
        ).eq('user_id', user.id).execute()

        if not result.data:
            return []

        wishlist_items = result.data
        formatted_items = []

        # Get book details and check for listings for each wishlist item
        for item in wishlist_items:
            # Get book details
            book_result = sb.from_('books').select('*').eq('id', item['book_id']).single().execute()

            if not book_result.data:
                continue  # Skip if book doesn't exist

            book = book_result.data

            # Check if there are any active listings for this book
            listings_result = sb.from_('book_listings').select(
                'id'
            ).eq('book_id', item['book_id']).eq('is_available', True).limit(1).execute()

            has_listings = len(listings_result.data) > 0

            # Format public URL for book cover
            public_books_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/book-covers"

            formatted_item = {
                'book': {
                    'id': book['id'],
                    'title': book['title'],
                    'authors': book['authors'],
                    'image_url': f"{public_books_url}/{book['image_url']}" if book.get('image_url') else None
                },
                'has_active_listings': has_listings
            }

            formatted_items.append(formatted_item)

        return formatted_items

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/wishlist/{book_id}')
async def add_to_wishlist(book_id: str, user=Depends(get_current_user)):
    """Add a book to the user's wishlist"""
    try:
        # First check if the book exists
        book_result = sb.from_('books').select('id').eq('id', book_id).single().execute()
        if not book_result.data:
            raise HTTPException(status_code=404, detail="Book not found")

        # Add to wishlist
        try:
            result = sb.from_('wishlists').insert({
                'user_id': user.id,
                'book_id': book_id
            }).execute()


            return {'message': 'Book added to wishlist successfully'}
        except Exception as e:
            # Check if it's a duplicate entry error
            if 'unique constraint' in str(e).lower():
                raise HTTPException(status_code=400, detail="Book is already in your wishlist")
            raise e

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete('/wishlist/{book_id}')
async def remove_from_wishlist(book_id: str, user=Depends(get_current_user)):
    """Remove a book from the user's wishlist"""
    try:
        result = sb.from_('wishlists').delete().eq('user_id', user.id).eq('book_id', book_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Book not found in wishlist")

        return {'message': 'Book removed from wishlist successfully'}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/wishlist/books')
async def get_wishlist_book_ids(user=Depends(get_current_user)):
    """Get just the book IDs that are in the user's wishlist"""
    try:
        result = sb.from_('wishlists').select('book_id').eq('user_id', user.id).execute()

        # Return just the list of book IDs
        return {
            'wishlist_book_ids': [item['book_id'] for item in result.data]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))