from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:3000",  # Your frontend URL
    "http://127.0.0.1:3000",
]

def add_cors_middleware(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,  # Update this with your allowed origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
