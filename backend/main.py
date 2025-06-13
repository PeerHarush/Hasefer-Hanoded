# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# import uvicorn
#
# # Import routers
# from src.auth import router as auth_router
# from src.users import router as users_router
# from src.books import router as books_router
# from src.book_listings import router as book_listings_router
# from src.wishlist import router as wishlist_router
# from src.book_comments import router as book_comments_router
# from src.transactions import router as transactions_router
# from src.chat import router as chat_router
# from src.points import router as points_router
# from dotenv import load_dotenv
# load_dotenv()
#
# # Create FastAPI app
# app = FastAPI(
#     title="Book Marketplace API",
#     description="API for a book marketplace application with user auth, profiles, books & images via Supabase"
# )
#
#
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#
# # Include routers
# app.include_router(auth_router)
# app.include_router(users_router)
# app.include_router(books_router)
# app.include_router(book_listings_router)
# app.include_router(wishlist_router)
# app.include_router(book_comments_router)
# app.include_router(transactions_router)
# app.include_router(chat_router)
# app.include_router(points_router)
#
#
# if __name__ == "__main__":
#     # Corrected run command for modules inside src
#     uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)

import requests

API_KEY = 'YOUR_API_KEY'
url = f'https://financialmodelingprep.com/api/v3/historical-price-full/QQQ?apikey=e5657e1a0420bfc5c7942babaa027baf&serietype=line'

res = requests.get(url).json()
hist = res['historical']

today = hist[0]['close']
yesterday = hist[1]['close']

daily_yield = (today - yesterday) / yesterday

print(f"QQQ daily yield (approx): {daily_yield:.4%}")
