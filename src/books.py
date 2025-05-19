from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
import os
import uuid

from src.db import sb

router = APIRouter(tags=["books"])


@router.post('/books')
async def create_book(
        title: str = Form(...),
        authors: str = Form(...),
        genres: str = Form(...),
        description: str = Form(...),
        cover_image: Optional[UploadFile] = File(None)
):
    # Process authors and genres
    authors_list = [author.strip() for author in authors.split(',') if author.strip()]
    genres_list = [genre.strip() for genre in genres.split(',') if genre.strip()]

    # Handle cover image upload or default
    image_path = 'book-covers/default.png'
    if cover_image:
        ext = os.path.splitext(cover_image.filename)[1].lower()

        # Validate image format
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
        content = await cover_image.read()

        try:
            sb.storage.from_('book-covers').upload(
                path=key,
                file=content,
                file_options={"content-type": content_type}
            )
            image_path = f"{key}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Cover image upload failed: {e}")

    book_data = {
        'title': title,
        'authors': authors_list,
        'genres': genres_list,
        'description': description,
        'image_url': image_path
    }

    try:
        result = sb.from_('books').insert(book_data).execute()
        return result.data[0]
    except Exception as e:
        # If book creation fails, try to delete the uploaded image
        if cover_image and image_path != 'book-covers/default.png':
            try:
                sb.storage.from_('book-covers').remove([image_path])
            except Exception:
                pass  # Ignore cleanup errors
        raise HTTPException(status_code=400, detail=str(e))


@router.get('/books')
async def list_books(
        search: Optional[str] = None,
        genre: Optional[str] = None,
        author: Optional[str] = None
):
    query = sb.from_('books').select('*')

    if search:
        query = query.ilike('title', f'%{search}%')
    if genre:
        query = query.contains('genres', [genre])
    if author:
        query = query.contains('authors', [author])

    try:
        result = query.execute()
        books = result.data

        # Convert image paths to public URLs
        public_url_base = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/book-covers"
        for book in books:
            if book.get('image_url'):
                book['image_url'] = f"{public_url_base}/{book['image_url']}"

        return books
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.put('/books/{book_id}')
async def update_book(
        book_id: str,
        title: Optional[str] = Form(None),
        authors: Optional[str] = Form(None),
        genres: Optional[str] = Form(None),
        description: Optional[str] = Form(None),
        cover_image: Optional[UploadFile] = File(None)
):
    updates = {}

    if title is not None:
        updates['title'] = title
    if authors is not None:
        updates['authors'] = [author.strip() for author in authors.split(',') if author.strip()]
    if genres is not None:
        updates['genres'] = [genre.strip() for genre in genres.split(',') if genre.strip()]
    if description is not None:
        updates['description'] = description

    # Handle cover image update
    if cover_image:
        try:
            result = sb.from_('books').select('image_url').eq('id', book_id).single().execute()
            current_image_url = result.data.get('image_url')

            # Delete old cover if it exists and isn't the default
            if current_image_url and current_image_url != 'book-covers/default.png':
                try:
                    sb.storage.from_('book-covers').remove([current_image_url])
                except Exception as e:
                    print(f"Failed to delete old cover: {e}")

            # Upload new cover
            ext = os.path.splitext(cover_image.filename)[1].lower()
            key = f"{uuid.uuid4().hex}{ext}"
            content = await cover_image.read()

            # Determine content type based on file extension
            content_type = None
            if ext == '.png':
                content_type = 'image/png'
            elif ext in ['.jpg', '.jpeg']:
                content_type = 'image/jpeg'
            elif ext == '.gif':
                content_type = 'image/gif'
            else:
                raise HTTPException(status_code=400, detail="Unsupported image format")

            # Upload with content type specified
            sb.storage.from_('book-covers').upload(
                path=key,
                file=content,
                file_options={"content-type": content_type}
            )
            updates['image_url'] = f"{key}"

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Cover upload failed: {e}")

    if not updates:
        raise HTTPException(status_code=400, detail="No valid fields provided for update")

    try:
        result = sb.from_('books').update(updates).eq('id', book_id).execute()

        if len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Book not found")

        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete('/books/{book_id}')
async def delete_book(book_id: str):
    try:
        # Get the book's image_url before deletion
        result = sb.from_('books').select('image_url').eq('id', book_id).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Book not found")

        image_url = result.data.get('image_url')

        # Delete the book record
        result = sb.from_('books').delete().eq('id', book_id).execute()

        # If book deletion was successful and there was a non-default image, delete it
        if image_url and image_url != 'book-covers/default.png':
            try:
                sb.storage.from_('book-covers').remove([image_url])
            except Exception as e:
                print(f"Failed to delete cover: {e}")

        return {'message': 'Book deleted successfully'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))