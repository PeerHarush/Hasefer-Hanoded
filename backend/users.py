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


# Add this new endpoint to src/users.py

@router.get('/users/activity')
async def get_user_activity(user=Depends(get_current_user)):
    """Get comprehensive activity history for the current user including points"""
    try:
        activities = []

        # 1. Get user's comments/ratings
        comments_result = sb.from_('book_comments').select(
            'id, created_at, updated_at, comment_text, rating, book_id'
        ).eq('user_id', user.id).execute()

        for comment in comments_result.data:
            # Get book details
            book_result = sb.from_('books').select('id, title, image_url').eq('id',
                                                                              comment['book_id']).single().execute()
            book_data = book_result.data if book_result.data else {}

            # Format book image URL
            if book_data.get('image_url'):
                public_books_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/book-covers"
                book_data['image_url'] = f"{public_books_url}/{book_data['image_url']}"

            activities.append({
                'id': f"comment_{comment['id']}",
                'type': 'comment_created',
                'timestamp': comment['created_at'],
                'description': f"Added a comment and {comment['rating']}-star rating for '{book_data.get('title', 'Unknown Book')}'",
                'details': {
                    'comment_text': comment['comment_text'],
                    'rating': comment['rating'],
                    'book': book_data
                }
            })

            # Add points activity for comment (30 points)
            activities.append({
                'id': f"points_comment_{comment['id']}",
                'type': 'points_earned',
                'timestamp': comment['created_at'],
                'description': f"Earned 30 points for adding a comment",
                'details': {
                    'points': 30,
                    'reason': 'Added comment',
                    'book': book_data
                }
            })

            # Add points activity for rating (20 points)
            activities.append({
                'id': f"points_rating_{comment['id']}",
                'type': 'points_earned',
                'timestamp': comment['created_at'],
                'description': f"Earned 20 points for adding a rating",
                'details': {
                    'points': 20,
                    'reason': 'Added rating',
                    'book': book_data
                }
            })

            # Add separate activity for updates if different from created_at
            if comment['updated_at'] != comment['created_at']:
                activities.append({
                    'id': f"comment_updated_{comment['id']}",
                    'type': 'comment_updated',
                    'timestamp': comment['updated_at'],
                    'description': f"Updated comment for '{book_data.get('title', 'Unknown Book')}'",
                    'details': {
                        'comment_text': comment['comment_text'],
                        'rating': comment['rating'],
                        'book': book_data
                    }
                })

        # 2. Get user's book listings
        listings_result = sb.from_('book_listings').select(
            'id, created_at, price, condition, book_id, is_sold'
        ).eq('seller_id', user.id).execute()

        for listing in listings_result.data:
            # Get book details
            book_result = sb.from_('books').select('id, title, image_url').eq('id',
                                                                              listing['book_id']).single().execute()
            book_data = book_result.data if book_result.data else {}

            # Format book image URL
            if book_data.get('image_url'):
                public_books_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/book-covers"
                book_data['image_url'] = f"{public_books_url}/{book_data['image_url']}"

            activities.append({
                'id': f"listing_{listing['id']}",
                'type': 'listing_created',
                'timestamp': listing['created_at'],
                'description': f"Listed '{book_data.get('title', 'Unknown Book')}' for sale at ₪{listing['price']}",
                'details': {
                    'price': listing['price'],
                    'condition': listing['condition'],
                    'is_sold': listing.get('is_sold', False),
                    'book': book_data
                }
            })

            # Add points activity for listing (50 points)
            activities.append({
                'id': f"points_listing_{listing['id']}",
                'type': 'points_earned',
                'timestamp': listing['created_at'],
                'description': f"Earned 50 points for creating a listing",
                'details': {
                    'points': 50,
                    'reason': 'Created listing',
                    'book': book_data
                }
            })

        # 3. Get transactions where user is buyer
        buyer_transactions_result = sb.from_('transactions').select(
            'id, created_at, status, listing_id'
        ).eq('buyer_id', user.id).execute()

        for transaction in buyer_transactions_result.data:
            # Get listing and book details
            listing_result = sb.from_('book_listings').select(
                'price, condition, book_id'
            ).eq('id', transaction['listing_id']).single().execute()

            if listing_result.data:
                book_result = sb.from_('books').select('id, title, image_url').eq('id', listing_result.data[
                    'book_id']).single().execute()
                book_data = book_result.data if book_result.data else {}

                # Format book image URL
                if book_data.get('image_url'):
                    public_books_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/book-covers"
                    book_data['image_url'] = f"{public_books_url}/{book_data['image_url']}"

                status_descriptions = {
                    'pending': 'reserved',
                    'completed': 'purchased',
                    'cancelled': 'had reservation cancelled for'
                }

                activities.append({
                    'id': f"transaction_buyer_{transaction['id']}",
                    'type': 'transaction_buyer',
                    'timestamp': transaction['created_at'],
                    'description': f"You {status_descriptions.get(transaction['status'], transaction['status'])} '{book_data.get('title', 'Unknown Book')}' for ₪{listing_result.data['price']}",
                    'details': {
                        'status': transaction['status'],
                        'price': listing_result.data['price'],
                        'condition': listing_result.data['condition'],
                        'role': 'buyer',
                        'book': book_data
                    }
                })

                # Add points for completed transaction (90 points)
                if transaction['status'] == 'completed':
                    activities.append({
                        'id': f"points_transaction_buyer_{transaction['id']}",
                        'type': 'points_earned',
                        'timestamp': transaction['created_at'],
                        'description': f"Earned 90 points for completing a transaction",
                        'details': {
                            'points': 90,
                            'reason': 'Completed transaction as buyer',
                            'book': book_data
                        }
                    })

        # 4. Get transactions where user is seller
        seller_transactions_result = sb.from_('transactions').select(
            'id, created_at, status, listing_id, buyer_id'
        ).eq('seller_id', user.id).execute()

        for transaction in seller_transactions_result.data:
            # Get listing and book details
            listing_result = sb.from_('book_listings').select(
                'price, condition, book_id'
            ).eq('id', transaction['listing_id']).single().execute()

            # Get buyer details
            buyer_result = sb.from_('profiles').select(
                'id, full_name, avatar_url'
            ).eq('id', transaction['buyer_id']).single().execute()
            buyer_data = buyer_result.data if buyer_result.data else {}

            # Format buyer avatar URL
            if buyer_data.get('avatar_url'):
                public_avatars_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public"
                buyer_data['avatar_url'] = f"{public_avatars_url}/{buyer_data['avatar_url']}"

            if listing_result.data:
                book_result = sb.from_('books').select('id, title, image_url').eq('id', listing_result.data[
                    'book_id']).single().execute()
                book_data = book_result.data if book_result.data else {}

                # Format book image URL
                if book_data.get('image_url'):
                    public_books_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/book-covers"
                    book_data['image_url'] = f"{public_books_url}/{book_data['image_url']}"

                status_descriptions = {
                    'pending': f"received a reservation from {buyer_data.get('full_name', 'Unknown User')} for",
                    'completed': f"sold to {buyer_data.get('full_name', 'Unknown User')}",
                    'cancelled': f"cancelled transaction with {buyer_data.get('full_name', 'Unknown User')} for"
                }

                activities.append({
                    'id': f"transaction_seller_{transaction['id']}",
                    'type': 'transaction_seller',
                    'timestamp': transaction['created_at'],
                    'description': f"You {status_descriptions.get(transaction['status'], transaction['status'])} '{book_data.get('title', 'Unknown Book')}' for ₪{listing_result.data['price']}",
                    'details': {
                        'status': transaction['status'],
                        'price': listing_result.data['price'],
                        'condition': listing_result.data['condition'],
                        'role': 'seller',
                        'buyer': buyer_data,
                        'book': book_data
                    }
                })

                # Add points for completed transaction (90 points)
                if transaction['status'] == 'completed':
                    activities.append({
                        'id': f"points_transaction_seller_{transaction['id']}",
                        'type': 'points_earned',
                        'timestamp': transaction['created_at'],
                        'description': f"Earned 90 points for completing a transaction",
                        'details': {
                            'points': 90,
                            'reason': 'Completed transaction as seller',
                            'book': book_data
                        }
                    })

        # 5. Get wishlist additions
        try:
            wishlist_result = sb.from_('wishlists').select(
                'book_id, created_at'
            ).eq('user_id', user.id).execute()

            for wishlist_item in wishlist_result.data:
                # Get book details
                book_result = sb.from_('books').select('id, title, image_url').eq('id', wishlist_item[
                    'book_id']).single().execute()
                book_data = book_result.data if book_result.data else {}

                # Format book image URL
                if book_data.get('image_url'):
                    public_books_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/book-covers"
                    book_data['image_url'] = f"{public_books_url}/{book_data['image_url']}"

                activities.append({
                    'id': f"wishlist_{wishlist_item['book_id']}",
                    'type': 'wishlist_added',
                    'timestamp': wishlist_item.get('created_at', ''),
                    'description': f"Added '{book_data.get('title', 'Unknown Book')}' to wishlist",
                    'details': {
                        'book': book_data
                    }
                })
        except Exception as e:
            # Skip wishlist if created_at field doesn't exist
            print(f"Skipping wishlist activities: {str(e)}")

        # 6. Get all chat messages from user
        messages_result = sb.from_('chat_messages').select(
            'id, created_at, message, chat_room_id'
        ).eq('sender_id', user.id).order('created_at.desc').execute()

        for message in messages_result.data:
            # Get chat room and listing details to provide context
            chat_room_result = sb.from_('chat_rooms').select(
                'listing_id'
            ).eq('id', message['chat_room_id']).single().execute()

            if chat_room_result.data:
                listing_result = sb.from_('book_listings').select(
                    'book_id'
                ).eq('id', chat_room_result.data['listing_id']).single().execute()

                if listing_result.data:
                    book_result = sb.from_('books').select('id, title').eq('id', listing_result.data[
                        'book_id']).single().execute()
                    book_data = book_result.data if book_result.data else {}

                    activities.append({
                        'id': f"message_{message['id']}",
                        'type': 'message_sent',
                        'timestamp': message['created_at'],
                        'description': f"Sent a message about '{book_data.get('title', 'Unknown Book')}'",
                        'details': {
                            'message': message['message'],
                            'book_title': book_data.get('title', 'Unknown Book')
                        }
                    })

        # 7. Add signup points (10 points) - we can get this from the user's profile creation
        try:
            # Get user profile creation date to add signup points
            profile_result = sb.from_('profiles').select('created_at').eq('id', user.id).single().execute()
            if profile_result.data and profile_result.data.get('created_at'):
                activities.append({
                    'id': f"points_signup_{user.id}",
                    'type': 'points_earned',
                    'timestamp': profile_result.data['created_at'],
                    'description': f"Earned 10 points for signing up",
                    'details': {
                        'points': 10,
                        'reason': 'Account registration'
                    }
                })
        except Exception as e:
            print(f"Could not add signup points: {str(e)}")

        # Sort all activities by timestamp (most recent first)
        activities.sort(key=lambda x: x['timestamp'], reverse=True)

        # Calculate total points earned
        total_points_earned = sum(
            activity['details'].get('points', 0)
            for activity in activities
            if activity['type'] == 'points_earned'
        )

        # Get current points from profile
        current_profile = sb.from_('profiles').select('points').eq('id', user.id).single().execute()
        current_points = current_profile.data.get('points', 0) if current_profile.data else 0

        return {
            'activities': activities,
            'total_count': len(activities),
            'points_summary': {
                'current_points': current_points,
                'total_points_earned': total_points_earned
            }
        }

    except Exception as e:
        print(f"Error in get_user_activity: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))