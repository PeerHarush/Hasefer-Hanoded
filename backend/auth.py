from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
import os
import uuid

from src.db import sb
from src.models import LoginModel, PasswordUpdateModel, RefreshModel
from src.email_service import EmailService

router = APIRouter(tags=["auth"])
security = HTTPBearer()
email_service = EmailService()


# --- Auth Dependency ---
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        res = sb.auth.get_user(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
    user = getattr(res, 'user', None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return user


@router.post('/signup')
async def signup(
        email: str = Form(...),
        password: str = Form(...),
        full_name: str = Form(...),
        address: Optional[str] = Form(None),
        favorite_genres: Optional[str] = Form(None),  # comma-separated
        phone_number: Optional[str] = Form(None),
        avatar: Optional[UploadFile] = File(None)
):
    # Process genres
    genres_list: List[str] = []
    if favorite_genres:
        genres_list = [g.strip() for g in favorite_genres.split(',') if g.strip()]

    # Handle avatar upload or default
    avatar_path = 'default.png'
    if avatar:
        ext = os.path.splitext(avatar.filename)[1].lower()

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
        content = await avatar.read()

        try:
            sb.storage.from_('avatars').upload(
                path=key,
                file=content,
                file_options={"content-type": content_type}
            )
            avatar_path = f"{key}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Avatar upload failed: {e}")

    # Build credentials with metadata
    metadata = {
        'full_name': full_name,
        'address': address,
        'favorite_genres': genres_list,
        'phone_number': phone_number,
        'avatar_url': avatar_path
    }
    credentials = {
        'email': email,
        'password': password,
        'options': {'data': metadata}
    }

    # Create user with metadata
    try:
        signup_res = sb.auth.sign_up(credentials)
    except Exception as e:
        # If signup fails, try to delete the uploaded avatar
        if avatar and avatar_path != 'avatars/default.png':
            try:
                sb.storage.from_('avatars').remove([avatar_path])
            except Exception:
                pass  # Ignore cleanup errors
        raise HTTPException(status_code=400, detail=str(e))

    # Send welcome email
    try:
        email_service.send_welcome_notification(
            user_email=email,
            full_name=full_name
        )
    except Exception as e:
        # Log the error but don't block signup
        print(f"Failed to send welcome email: {e}")

    return {'message': 'Signup successful', 'user_id': signup_res.user.id}


@router.post('/login')
async def login(data: LoginModel):
    try:
        res = sb.auth.sign_in_with_password({'email': data.email, 'password': data.password})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {
        'access_token': res.session.access_token,
        'refresh_token': res.session.refresh_token
    }


@router.put('/auth/password')
async def change_password(data: PasswordUpdateModel, user=Depends(get_current_user)):
    try:
        sb.auth.api.update_user(user.id, {'password': data.new_password})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {'message': 'Password changed successfully'}


@router.post('/auth/refresh', tags=["auth"])
async def refresh_token(data: RefreshModel):
    """
    Exchange a refresh token for a new access token and refresh token.
    """
    try:
        print("refresh token", data.refresh_token)
        # Use Supabase GoTrue API to exchange refresh token
        res = sb.auth.refresh_session(data.refresh_token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        'access_token': res.session.access_token,
        'refresh_token': res.session.refresh_token
    }