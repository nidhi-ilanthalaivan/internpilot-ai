from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.resume import router as resume_router



app = FastAPI()

# Configure CORS explicitly
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],  # Explicitly allow your frontend dev urls
    allow_credentials=True,
    allow_methods=["*"],  # Allows POST, GET, OPTIONS, etc.
    allow_headers=["*"],  # Allows all headers
)

app.include_router(resume_router)

@app.get("/")
def root():
    return {"message": "InternPilot backend running"}