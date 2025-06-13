# from fastapi import APIRouter, HTTPException, Depends
# from typing import List, Optional
# from pydantic import BaseModel
# import os
#
# from src.db import sb
# from src.auth import get_current_user
# from src.transactions import create_notification
#
# router = APIRouter(tags=["chat"])
#
#
# class SendMessage(BaseModel):
#     message: str
#
#
#
# @router.get('/chats')
# async def get_chat_rooms(user=Depends(get_current_user)):
#     """Get all chat rooms where user is either buyer or seller"""
#     try:
#         # Get rooms where user is buyer
#         result = sb.from_('chat_rooms') \
#             .select('*') \
#             .eq('buyer_id', user.id) \
#             .execute()
#         buyer_rooms = result.data
#
#         # Get rooms where user is seller
#         result = sb.from_('chat_rooms') \
#             .select('*') \
#             .eq('seller_id', user.id) \
#             .execute()
#         seller_rooms = result.data
#
#         # Combine results
#         chat_rooms = buyer_rooms + seller_rooms
#
#         # Format response with additional data
#         formatted_rooms = []
#         for room in chat_rooms:
#             # Get listing details with book
#             listing_result = sb.from_('book_listings') \
#                 .select('*, book:books(*)') \
#                 .eq('id', room['listing_id']) \
#                 .single() \
#                 .execute()
#             listing_data = listing_result.data if listing_result.data else {}
#
#             # Get buyer details
#             buyer_result = sb.from_('profiles') \
#                 .select('id, full_name, avatar_url') \
#                 .eq('id', room['buyer_id']) \
#                 .single() \
#                 .execute()
#             buyer_data = buyer_result.data if buyer_result.data else {}
#
#             # Get seller details
#             seller_result = sb.from_('profiles') \
#                 .select('id, full_name, avatar_url') \
#                 .eq('id', room['seller_id']) \
#                 .single() \
#                 .execute()
#             seller_data = seller_result.data if seller_result.data else {}
#
#             # Get unread messages count
#             unread_result = sb.from_('chat_messages') \
#                 .select('id', count='exact') \
#                 .eq('chat_room_id', room['id']) \
#                 .neq('sender_id', user.id) \
#                 .eq('is_read', False) \
#                 .execute()
#             unread_count = unread_result.count if hasattr(unread_result, 'count') else 0
#
#             # Format URLs
#             public_books_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/book-covers"
#             public_avatars_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public"
#
#             # Format book data
#             book_data = listing_data.get('book', {}) if listing_data else {}
#             if book_data and book_data.get('image_url'):
#                 book_data['image_url'] = f"{public_books_url}/{book_data['image_url']}"
#
#             # Format avatar URLs
#             if buyer_data and buyer_data.get('avatar_url'):
#                 buyer_data['avatar_url'] = f"{public_avatars_url}/{buyer_data['avatar_url']}"
#             if seller_data and seller_data.get('avatar_url'):
#                 seller_data['avatar_url'] = f"{public_avatars_url}/{seller_data['avatar_url']}"
#
#             # Get the last message in the room
#             last_message_result = sb.from_('chat_messages') \
#                 .select('*') \
#                 .eq('chat_room_id', room['id']) \
#                 .order('created_at', desc=True) \
#                 .limit(1) \
#                 .execute()
#             last_message = last_message_result.data[0] if last_message_result.data else None
#
#             if last_message:
#                 last_message = {
#                     'id': last_message['id'],
#                     'created_at': last_message['created_at'],
#                     'message': last_message['message'],
#                     'is_read': last_message['is_read'],
#                     'is_from_user': last_message['sender_id'] == user.id
#                 }
#
#             formatted_room = {
#                 'id': room['id'],
#                 'created_at': room['created_at'],
#                 'listing': {
#                     'id': listing_data.get('id'),
#                     'price': listing_data.get('price'),
#                     'condition': listing_data.get('condition'),
#                     'is_sold': listing_data.get('is_sold', False),
#                     'book': book_data
#                 },
#                 'other_user': seller_data if room['buyer_id'] == user.id else buyer_data,
#                 'last_message': last_message,
#                 'is_user_buyer': room['buyer_id'] == user.id,
#                 'unread_count': unread_count
#             }
#             formatted_rooms.append(formatted_room)
#
#         # Sort by created_at descending
#         formatted_rooms.sort(key=lambda x: x['created_at'], reverse=True)
#
#         return formatted_rooms
#
#     except Exception as e:
#         print("Error in get_chat_rooms:", str(e))  # Debug print
#         raise HTTPException(status_code=500, detail=str(e))
#
#
# @router.get('/chats/{chat_room_id}/messages')
# async def get_chat_messages(
#         chat_room_id: str,
#         limit: int = 50,
#         before_id: Optional[str] = None,
#         user=Depends(get_current_user)
# ):
#     """Get messages for a chat room with pagination"""
#     try:
#         # Verify user is part of this chat
#         chat_room = sb.from_('chat_rooms').select('*').eq('id', chat_room_id).single().execute()
#         if not chat_room.data or (
#                 chat_room.data['buyer_id'] != user.id and
#                 chat_room.data['seller_id'] != user.id
#         ):
#             raise HTTPException(status_code=403, detail="Access denied")
#
#         # Build query
#         query = sb.from_('chat_messages').select(
#             '''
#             *,
#             sender:profiles!chat_messages_sender_id_fkey(
#                 id,
#                 full_name,
#                 avatar_url
#             )
#             '''
#         ).eq('chat_room_id', chat_room_id)
#
#         if before_id:
#             query = query.lt('id', before_id)
#
#         query = query.order('created_at.desc').limit(limit)
#
#         result = query.execute()
#         messages = result.data
#
#         # Mark messages as read
#         sb.from_('chat_messages').update(
#             {'is_read': True}
#         ).eq('chat_room_id', chat_room_id).neq(
#             'sender_id', user.id
#         ).eq('is_read', False).execute()
#
#         # Format messages
#         formatted_messages = []
#         for message in messages:
#             sender = message.pop('sender', {})
#             if sender.get('avatar_url'):
#                 public_avatars_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/avatars"
#                 sender['avatar_url'] = f"{public_avatars_url}/{sender['avatar_url']}"
#
#             formatted_messages.append({
#                 'id': message['id'],
#                 'created_at': message['created_at'],
#                 'message': message['message'],
#                 'is_read': message['is_read'],
#                 'is_from_user': message['sender_id'] == user.id
#             })
#
#         return formatted_messages
#
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
#
#
# @router.post('/chats/{chat_room_id}/messages')
# async def send_message(
#     chat_room_id: str,
#     message_data: SendMessage,
#     user=Depends(get_current_user)
# ):
#     """Send a message in a chat room"""
#     try:
#         # Verify user is part of this chat
#         chat_room = sb.from_('chat_rooms').select('*').eq('id', chat_room_id).single().execute()
#
#         if not chat_room.data or (
#             chat_room.data['buyer_id'] != user.id and
#             chat_room.data['seller_id'] != user.id
#         ):
#             raise HTTPException(status_code=403, detail="Access denied")
#
#         # Get listing details
#         listing_result = sb.from_('book_listings').select('*').eq('id', chat_room.data['listing_id']).single().execute()
#         if not listing_result.data:
#             raise HTTPException(status_code=404, detail="Listing not found")
#
#         # Get book details
#         book_result = sb.from_('books').select('title').eq('id', listing_result.data['book_id']).single().execute()
#         if not book_result.data:
#             raise HTTPException(status_code=404, detail="Book not found")
#
#         # Send message
#         message_result = sb.from_('chat_messages').insert({
#             'chat_room_id': chat_room_id,
#             'sender_id': user.id,
#             'message': message_data.message
#         }).execute()
#
#         # Create notification for recipient
#         recipient_id = chat_room.data['seller_id'] if user.id == chat_room.data['buyer_id'] else chat_room.data[
#             'buyer_id']
#         book_result = sb.from_('books').select('title').eq('id', listing_result.data['book_id']).single().execute()
#         book_title = book_result.data['title']
#
#         await create_notification(
#             recipient_id,
#             f"New message about book '{book_title}'",
#             chat_room_id  # Pass chat_room_id instead of transaction_id
#         )
#
#         return message_result.data[0]
#
#     except Exception as e:
#         print(f"Error in send_message: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))