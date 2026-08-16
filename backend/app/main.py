from fastapi import FastAPI
from app.api.api_router import api_router

app = FastAPI(title="AegisSOC API", version="0.1.0")

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "AegisSOC API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}