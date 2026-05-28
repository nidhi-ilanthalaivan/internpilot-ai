from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from routes.resume import router as resume_router
import json
import asyncio

from database.config import engine
from database import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router)

@app.get("/")
def root():
    return {"message": "InternPilot backend running with Database Memory enabled!"}

# PHASE 3: FREE REALTIME VOICE INTERVIEW STREAMING GATEWAY
@app.websocket("/interview/stream")
async def websocket_interview_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("🎙️ InternPilot Voice Engine: Realtime WebSocket pipeline established.")
    
    try:
        while True:
            # Receive data packets from frontend (can be text signaling or raw audio bytes)
            message = await websocket.receive()
            
            if "text" in message:
                data = json.loads(message["text"])
                event_type = data.get("event")
                
                if event_type == "START_SESSION":
                    print("🎯 Voice Session Initialized by client.")
                    await websocket.send_json({
                        "event": "AI_SPEECH",
                        "text": "Hello! Welcome to your automated mock interview. Let's start with your first background question. Can you walk me through your technical stack?"
                    })
                    
            elif "bytes" in message:
                raw_audio_chunk = message["bytes"]
                # This is where raw mic data lands in real time
                print(f"📥 Received raw audio package stream chunk: {len(raw_audio_chunk)} bytes.")
                
                # TODO: Pass chunk into our upcoming local speech-to-text decoder engine
                
    except WebSocketDisconnect:
        print("🛑 InternPilot Voice Engine: Active audio pipeline disconnected clean.")