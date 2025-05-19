from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional
import os
import uuid

from src.db import sb
from src.auth import get_current_user

router = APIRouter(tags=["users"])


@router.get('/users')
async def get_profile(user=Depends(get_current_user)):
    try:
        result = sb.from_('profiles').select('*').eq('id', user.id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")

        profile = result.data

        # Extract the bucket and the file path from the URL
        file_path = profile['avatar_url'].split('/')[1]
        bucket = profile['avatar_url'].split('/')[0]

        # Create signed URL that's valid for 24 hours
        signed_url = sb.storage.from_(bucket).create_signed_url(file_path, expires_in=86400)

        # Update the profile with the signed URL
        profile['avatar_url'] = signed_url['signedURL']

        return profile

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


1


@router.put('/users')
async def update_profile(
        full_name: Optional[str] = Form(None),
        address: Optional[str] = Form(None),
        favorite_genres: Optional[str] = Form(None),
        phone_number: Optional[str] = Form(None),
        avatar: Optional[UploadFile] = File(None),
        user=Depends(get_current_user)
):
    updates = {}
    if full_name is not None:
        updates['full_name'] = full_name
    if address is not None:
        updates['address'] = address
    if favorite_genres is not None:
        updates['favorite_genres'] = [g.strip() for g in favorite_genres.split(',') if g.strip()]
    if phone_number is not None:
        updates['phone_number'] = phone_number

    # Handle avatar upload
    if avatar:
        try:
            result = sb.from_('profiles').select('avatar_url').eq('id', user.id).single().execute()
            current_avatar_url = result.data.get('avatar_url')

            # Delete old avatar if it exists
            if current_avatar_url:
                try:
                    sb.storage.from_('avatars').remove([current_avatar_url])
                except Exception as e:
                    print(f"Failed to delete old avatar: {e}")

            # Upload new avatar
            ext = os.path.splitext(avatar.filename)[1].lower()
            key = f"{uuid.uuid4().hex}{ext}"
            content = await avatar.read()

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
            sb.storage.from_('avatars').upload(
                path=key,
                file=content,
                file_options={"content-type": content_type}
            )
            updates['avatar_url'] = f"avatars/{key}"

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Avatar upload failed: {e}")

    if not updates:
        raise HTTPException(status_code=400, detail="No valid fields provided for update")

    try:
        result = sb.from_('profiles').update(updates).eq('id', user.id).execute()

        if len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Profile not found")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {'message': 'Profile updated successfully'}
