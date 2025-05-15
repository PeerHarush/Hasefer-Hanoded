from fastapi import APIRouter, HTTPException, Depends
from enum import Enum
from pydantic import BaseModel
import os

from src.db import sb
from src.auth import get_current_user
from src.points import award_points, PointsAction

router = APIRouter(tags=["transactions"])


class TransactionStatus(str, Enum):
    PENDING = "pending"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class UpdateTransaction(BaseModel):
    status: TransactionStatus


async def create_notification(user_id: str, message: str, chat_room_id: str):
    """Helper function to create notifications"""
    try:
        sb.from_('notifications').insert({
            'user_id': user_id,
            'message': message,
            'chat_room_id': chat_room_id
        }).execute()
    except Exception as e:
        print(f"Error creating notification: {str(e)}")


@router.post('/listings/{listing_id}/reserve')
async def reserve_listing(
        listing_id: str,
        user=Depends(get_current_user)
):
    """Reserve a listing, create a transaction, and start a chat"""
    try:
        # Get listing details first
        listing_result = sb.from_('book_listings').select('*').eq('id', listing_id).single().execute()

        if not listing_result.data:
            raise HTTPException(status_code=404, detail="Listing not found")

        listing = listing_result.data

        # Get book details separately using book_id
        book_result = sb.from_('books').select('title').eq('id', listing['book_id']).single().execute()
        if not book_result.data:
            raise HTTPException(status_code=404, detail="Book not found")

        book_title = book_result.data['title']

        # Check if listing is available
        if listing.get('is_sold') or not listing.get('is_available', True):
            raise HTTPException(status_code=400, detail="This listing is no longer available")

        # Check if user is not trying to buy their own listing
        if listing['seller_id'] == user.id:
            raise HTTPException(status_code=400, detail="You cannot reserve your own listing")

        # Create transaction
        transaction_data = {
            'listing_id': listing_id,
            'buyer_id': user.id,
            'seller_id': listing['seller_id'],
            'status': 'pending'
        }

        transaction_result = sb.from_('transactions').insert(transaction_data).execute()
        transaction = transaction_result.data[0]

        # Create chat room
        chat_room_data = {
            'listing_id': listing_id,
            'buyer_id': user.id,
            'seller_id': listing['seller_id']
        }

        try:
            chat_room_result = sb.from_('chat_rooms').insert(chat_room_data).execute()
            chat_room = chat_room_result.data[0]
        except Exception as e:
            if 'unique constraint' in str(e).lower():
                chat_room_result = sb.from_('chat_rooms').select(
                    '*'
                ).eq('listing_id', listing_id).eq('buyer_id', user.id).single().execute()
                chat_room = chat_room_result.data
            else:
                raise e

        # Send automatic first message
        automatic_message = f"Hi! I'm interested in purchasing '{book_title}' and have reserved it. Looking forward to discussing the details with you."

        message_result = sb.from_('chat_messages').insert({
            'chat_room_id': chat_room['id'],
            'sender_id': user.id,
            'message': automatic_message
        }).execute()

        # Create notification for seller with chat room reference
        notification_message = f"New reservation and message for your book '{book_title}'"

        # Make sure we have a chat room ID before creating the notification
        if not chat_room or not chat_room.get('id'):
            raise HTTPException(status_code=500, detail="Failed to create or retrieve chat room")

        await create_notification(
            listing['seller_id'],
            notification_message,
            chat_room['id']  # Make sure this is being passed correctly
        )

        return {
            'transaction_id': transaction['id'],
            'chat_room_id': chat_room['id'],
            'message': message_result.data[0]
        }

    except Exception as e:
        print(f"Error in reserve_listing: {str(e)}")  # Add debug print
        # If anything fails, try to clean up
        try:
            if 'transaction' in locals():
                sb.from_('transactions').delete().eq('id', transaction['id']).execute()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/transactions')
async def get_user_transactions(user=Depends(get_current_user)):
    """Get all transactions where user is either buyer or seller"""
    try:
        # Simpler query first
        result = sb.from_('transactions') \
            .select('*') \
            .eq('buyer_id', user.id) \
            .execute()

        buyer_transactions = result.data

        result = sb.from_('transactions') \
            .select('*') \
            .eq('seller_id', user.id) \
            .execute()

        seller_transactions = result.data

        # Combine results
        transactions = buyer_transactions + seller_transactions

        # Now get additional data for each transaction
        formatted_transactions = []
        for transaction in transactions:
            # Get listing details
            listing_result = sb.from_('book_listings') \
                .select('*, book:books(*)') \
                .eq('id', transaction['listing_id']) \
                .single() \
                .execute()
            listing_data = listing_result.data if listing_result.data else {}

            # Get buyer details
            buyer_result = sb.from_('profiles') \
                .select('id, full_name, avatar_url') \
                .eq('id', transaction['buyer_id']) \
                .single() \
                .execute()
            buyer_data = buyer_result.data if buyer_result.data else {}

            # Get seller details
            seller_result = sb.from_('profiles') \
                .select('id, full_name, avatar_url') \
                .eq('id', transaction['seller_id']) \
                .single() \
                .execute()
            seller_data = seller_result.data if seller_result.data else {}

            # Format URLs
            public_books_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/book-covers"
            public_avatars_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/avatars"

            # Format book data
            book_data = listing_data.get('book', {}) if listing_data else {}
            if book_data and book_data.get('image_url'):
                book_data['image_url'] = f"{public_books_url}/{book_data['image_url']}"

            # Format avatar URLs
            if buyer_data and buyer_data.get('avatar_url'):
                buyer_data['avatar_url'] = f"{public_avatars_url}/{buyer_data['avatar_url']}"
            if seller_data and seller_data.get('avatar_url'):
                seller_data['avatar_url'] = f"{public_avatars_url}/{seller_data['avatar_url']}"

            formatted_transaction = {
                'id': transaction['id'],
                'created_at': transaction['created_at'],
                'status': transaction['status'],
                'listing': {
                    'id': listing_data.get('id'),
                    'price': listing_data.get('price'),
                    'condition': listing_data.get('condition'),
                    'book': book_data
                },
                'buyer': buyer_data,
                'seller': seller_data,
                'is_user_buyer': transaction['buyer_id'] == user.id
            }
            formatted_transactions.append(formatted_transaction)

        return formatted_transactions

    except Exception as e:
        print("Error in get_transactions:", str(e))  # Debug print
        raise HTTPException(status_code=500, detail=str(e))


@router.put('/transactions/{transaction_id}')
async def update_transaction_status(
        transaction_id: str,
        update_data: UpdateTransaction,
        user=Depends(get_current_user)
):
    """Update transaction status (only by seller)"""
    try:
        # Get transaction details
        transaction_result = sb.from_('transactions').select(
            'id, seller_id, buyer_id, listing_id'
        ).eq('id', transaction_id).single().execute()

        if not transaction_result.data:
            raise HTTPException(status_code=404, detail="Transaction not found")

        transaction = transaction_result.data

        # Get listing details with book details
        listing_result = sb.from_('book_listings').select(
            'id, book_id'
        ).eq('id', transaction['listing_id']).single().execute()

        if not listing_result.data:
            raise HTTPException(status_code=404, detail="Associated listing not found")

        listing = listing_result.data

        # Get book details
        book_result = sb.from_('books').select('title').eq('id', listing['book_id']).single().execute()
        if not book_result.data:
            raise HTTPException(status_code=404, detail="Associated book not found")

        book_title = book_result.data['title']

        # Verify user is the seller
        if transaction['seller_id'] != user.id:
            raise HTTPException(status_code=403, detail="Only the seller can update the transaction status")

        # Update transaction status
        result = sb.from_('transactions').update({
            'status': update_data.status
        }).eq('id', transaction_id).execute()

        # Handle completion
        if update_data.status == TransactionStatus.COMPLETED:
            # Award points to both parties
            await award_points(transaction['seller_id'], PointsAction.COMPLETE_TRANSACTION)
            await award_points(transaction['buyer_id'], PointsAction.COMPLETE_TRANSACTION)

            # Remove from buyer's wishlist if exists
            sb.from_('wishlists').delete().eq(
                'user_id', transaction['buyer_id']
            ).eq('book_id', listing['book_id']).execute()

            # Mark listing as sold
            sb.from_('book_listings').update({
                'is_sold': True,
                'is_available': False
            }).eq('id', transaction['listing_id']).execute()

            # Cancel all other pending transactions for this listing
            other_transactions = sb.from_('transactions').select('id, buyer_id').eq(
                'listing_id', transaction['listing_id']
            ).neq('id', transaction_id).eq('status', 'pending').execute()

            for other_trans in other_transactions.data:
                # Update status to cancelled
                sb.from_('transactions').update({
                    'status': TransactionStatus.CANCELLED
                }).eq('id', other_trans['id']).execute()

                # Notify other buyers
                await create_notification(
                    other_trans['buyer_id'],
                    f"Transaction cancelled: The book '{book_title}' has been sold to another buyer",
                    other_trans['id']
                )

        # Create notification for buyer
        notification_message = f"Transaction status updated to {update_data.status} for book '{book_title}'"
        await create_notification(transaction['buyer_id'], notification_message, transaction_id)

        return result.data[0]

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in update_transaction_status: {str(e)}")  # Debug print
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/notifications')
async def get_notifications(
        unread_only: bool = False,
        user=Depends(get_current_user)
):
    """Get user's notifications with chat room details"""
    try:
        # First get the chat room details
        notifications_result = sb.from_('notifications').select('*').eq('user_id', user.id)

        if unread_only:
            notifications_result = notifications_result.eq('is_read', False)

        notifications_result = notifications_result.order('created_at.desc').execute()

        notifications = []
        for notif in notifications_result.data:
            # If we have a chat_room_id, get the listing_id
            listing_id = None
            if notif.get('chat_room_id'):
                chat_room_result = sb.from_('chat_rooms').select('listing_id').eq('id', notif[
                    'chat_room_id']).single().execute()
                if chat_room_result.data:
                    listing_id = chat_room_result.data.get('listing_id')

            notifications.append({
                'id': notif['id'],
                'created_at': notif['created_at'],
                'message': notif['message'],
                'is_read': notif['is_read'],
                'chat_room_id': notif['chat_room_id'],
                'listing_id': listing_id
            })

        return notifications

    except Exception as e:
        print(f"Error in get_notifications: {str(e)}")  # Debug print
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/notifications/{notification_id}/mark-read')
async def mark_notification_read(notification_id: str, user=Depends(get_current_user)):
    """Mark a notification as read"""
    try:
        result = sb.from_('notifications').update({
            'is_read': True
        }).eq('id', notification_id).eq('user_id', user.id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Notification not found")

        return {'message': 'Notification marked as read'}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))