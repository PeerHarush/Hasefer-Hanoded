from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import Optional
from enum import Enum
import os
import uuid

from src.db import sb
from src.auth import get_current_user
from src.books import create_book
from src.points import award_points, PointsAction


class BookCondition(str, Enum):
    NEW = "New"
    USED_LIKE_NEW = "Used - Like New"
    USED_GOOD = "Used - Good"
    USED_POOR = "Used - Poor"


router = APIRouter(tags=["book-listings"])


@router.post('/book-listings')
async def create_listing(
        book_id: Optional[str] = Form(None),  # Optional because user might be creating a new book
        # New book fields (optional, only needed if book_id is not provided)
        title: Optional[str] = Form(None),
        authors: Optional[str] = Form(None),
        genres: Optional[str] = Form(None),
        book_description: Optional[str] = Form(None),
        book_cover: Optional[UploadFile] = File(None),
        # Listing specific fields
        condition: BookCondition = Form(...),
        price: float = Form(...),
        location: Optional[str] = Form(None),
        listing_image: Optional[UploadFile] = File(None),
        user=Depends(get_current_user)
):
    try:
        # If no book_id is provided, create a new book
        if not book_id:
            if not all([title, authors, genres, book_description]):
                raise HTTPException(
                    status_code=400,
                    detail="When creating a new book, title, authors, genres, and description are required"
                )

            # Create new book using the existing create_book function
            book_result = await create_book(
                title=title,
                authors=authors,
                genres=genres,
                description=book_description,
                cover_image=book_cover
            )
            book_id = book_result['id']

        # Handle listing image upload
        image_path = None
        if listing_image:
            ext = os.path.splitext(listing_image.filename)[1].lower()

            # Validate image format
            content_type = None
            if ext == '.png':
                content_type = 'image/png'
            elif ext in ['.jpg', '.jpeg']:
                content_type = 'image/jpeg'
            elif ext == '.gif':
                content_type = 'image/gif'
            else:
                raise HTTPException(status_code=400, detail="Unsupported image format")

            key = f"{uuid.uuid4().hex}{ext}"
            content = await listing_image.read()

            try:
                sb.storage.from_('listing-images').upload(
                    path=key,
                    file=content,
                    file_options={"content-type": content_type}
                )
                image_path = key
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Listing image upload failed: {e}")

        # If no location provided, use user's default address
        if not location:
            user_profile = sb.from_('profiles').select('address').eq('id', user.id).single().execute()
            location = user_profile.data.get('address', '')

        # Create the listing
        listing_data = {
            'seller_id': user.id,
            'book_id': book_id,
            'condition': condition,
            'price': price,
            'location': location,
            'image_url': image_path,
            'is_available': True
        }

        result = sb.from_('book_listings').insert(listing_data).execute()

        await award_points(user.id, PointsAction.ADD_LISTING)

        return result.data[0]

    except Exception as e:
        # Cleanup: If we uploaded an image but failed to create the listing, delete the image
        if image_path:
            try:
                sb.storage.from_('listing-images').remove([image_path])
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/book-listings')
async def list_book_listings(
        book_id: Optional[str] = None,
        seller_id: Optional[str] = None,
        show_all: bool = False,  # New parameter to show sold listings too
        limit: int = 10,
        offset: int = 0
):
    try:
        # Get listings - filter for available by default
        query = sb.from_('book_listings').select('*')

        if book_id:
            query = query.eq('book_id', book_id)
        if seller_id:
            query = query.eq('seller_id', seller_id)

        # Filter for available listings unless show_all is True
        if not show_all:
            query = query.eq('is_available', True)

        result = query.execute()
        listings = result.data

        # Format response
        formatted_listings = []
        for listing in listings:
            # Get book details
            book_result = sb.from_('books').select('*').eq('id', listing['book_id']).single().execute()

            # Get seller details
            seller_result = sb.from_('profiles').select('id, full_name, phone_number, avatar_url').eq('id', listing[
                'seller_id']).single().execute()

            # Format URLs
            public_listings_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/listing-images"
            public_books_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/book-covers"
            public_avatars_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/avatars"

            # Create formatted listing
            formatted_listing = {
                'id': listing['id'],
                'created_at': listing['created_at'],
                'price': listing['price'],
                'condition': listing['condition'],
                'location': listing['location'],
                'is_available': listing.get('is_available', True),
                'is_sold': listing.get('is_sold', False),
                'image_url': f"{public_listings_url}/{listing['image_url']}" if listing.get('image_url') else None,
                'book': {},
                'seller': {}
            }

            # Add book data if available
            if book_result.data:
                book = book_result.data
                formatted_listing['book'] = {
                    'id': book['id'],
                    'title': book['title'],
                    'authors': book['authors'],
                    'genres': book['genres'],
                    'image_url': f"{public_books_url}/{book['image_url']}" if book.get('image_url') else None
                }

            # Add seller data if available
            if seller_result.data:
                seller = seller_result.data
                formatted_listing['seller'] = {
                    'id': seller['id'],
                    'full_name': seller['full_name'],
                    'phone_number': seller['phone_number'],
                    'avatar_url': f"{public_avatars_url}/{seller['avatar_url']}" if seller.get('avatar_url') else None
                }

            formatted_listings.append(formatted_listing)

        return formatted_listings

    except Exception as e:
        print("Error:", str(e))  # Debug print
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/book-listings/{listing_id}')
async def get_book_listing(listing_id: str):
    try:
        # Get the listing
        result = sb.from_('book_listings').select('*').eq('id', listing_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Listing not found")

        listing = result.data

        # Get book details
        book_result = sb.from_('books').select('*').eq('id', listing['book_id']).single().execute()

        # Get seller details
        seller_result = sb.from_('profiles').select('id, full_name, phone_number, avatar_url').eq('id', listing[
            'seller_id']).single().execute()

        # Format URLs
        public_listings_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/listing-images"
        public_books_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/book-covers"
        public_avatars_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/avatars"

        # Create formatted listing
        formatted_listing = {
            'id': listing['id'],
            'created_at': listing['created_at'],
            'price': listing['price'],
            'condition': listing['condition'],
            'location': listing['location'],
            'is_available': listing.get('is_available', True),
            'is_sold': listing.get('is_sold', False),
            'image_url': f"{public_listings_url}/{listing['image_url']}" if listing.get('image_url') else None,
            'book': {},
            'seller': {}
        }

        # Add book data if available
        if book_result.data:
            book = book_result.data
            formatted_listing['book'] = {
                'id': book['id'],
                'title': book['title'],
                'authors': book['authors'],
                'genres': book['genres'],
                'image_url': f"{public_books_url}/{book['image_url']}" if book.get('image_url') else None
            }

        # Add seller data if available
        if seller_result.data:
            seller = seller_result.data
            formatted_listing['seller'] = {
                'id': seller['id'],
                'full_name': seller['full_name'],
                'phone_number': seller['phone_number'],
                'avatar_url': f"{public_avatars_url}/{seller['avatar_url']}" if seller.get('avatar_url') else None
            }

        return formatted_listing

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put('/book-listings/{listing_id}')
async def update_book_listing(
        listing_id: str,
        condition: Optional[BookCondition] = Form(None),
        price: Optional[float] = Form(None),
        location: Optional[str] = Form(None),
        listing_image: Optional[UploadFile] = File(None),
        is_available: Optional[bool] = Form(None),
        user=Depends(get_current_user)
):
    try:
        # First check if the listing exists and belongs to the user
        existing = sb.from_('book_listings').select('image_url').eq('id', listing_id).eq('seller_id',
                                                                                         user.id).single().execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Listing not found or you don't have permission to edit it")

        updates = {}

        if condition is not None:
            updates['condition'] = condition
        if price is not None:
            updates['price'] = price
        if location is not None:
            updates['location'] = location
        if is_available is not None:
            updates['is_available'] = is_available

        # Handle image update
        if listing_image:
            old_image_url = existing.data.get('image_url')

            # Delete old image if it exists
            if old_image_url:
                try:
                    sb.storage.from_('listing-images').remove([old_image_url])
                except Exception as e:
                    print(f"Failed to delete old listing image: {e}")

            # Upload new image
            ext = os.path.splitext(listing_image.filename)[1].lower()
            content_type = None
            if ext == '.png':
                content_type = 'image/png'
            elif ext in ['.jpg', '.jpeg']:
                content_type = 'image/jpeg'
            elif ext == '.webp':
                content_type = 'image/webp'
            else:
                raise HTTPException(status_code=400, detail="Unsupported image format")

            key = f"{uuid.uuid4().hex}{ext}"
            content = await listing_image.read()

            sb.storage.from_('listing-images').upload(
                path=key,
                file=content,
                file_options={"content-type": content_type}
            )
            updates['image_url'] = key

        if not updates:
            raise HTTPException(status_code=400, detail="No valid fields provided for update")

        result = sb.from_('book_listings').update(updates).eq('id', listing_id).eq('seller_id', user.id).execute()

        if len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Listing not found or update failed")

        return result.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete('/book-listings/{listing_id}')
async def delete_book_listing(listing_id: str, user=Depends(get_current_user)):
    try:
        # Get the listing's image_url before deletion
        result = sb.from_('book_listings').select('image_url').eq('id', listing_id).eq('seller_id',
                                                                                       user.id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Listing not found or you don't have permission to delete it")

        image_url = result.data.get('image_url')

        # Delete the listing
        result = sb.from_('book_listings').delete().eq('id', listing_id).eq('seller_id', user.id).execute()

        # If listing deletion was successful and there was an image, delete it
        if image_url:
            try:
                sb.storage.from_('listing-images').remove([image_url])
            except Exception as e:
                print(f"Failed to delete listing image: {e}")

        return {'message': 'Listing deleted successfully'}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))