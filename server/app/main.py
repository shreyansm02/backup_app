from fastapi import FastAPI
from app.api.routes import router
from app.core.database import SessionLocal, engine, Base
from app.middleware.cors import add_cors_middleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(router)

# Add the CORS middleware
add_cors_middleware(app)