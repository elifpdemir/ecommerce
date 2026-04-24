from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from agent import run_agent
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="E-Commerce AI Agent API")

# Angular'dan gelen isteklere izin ver
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "changeme")

# --- JWT Doğrulama ---
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload  # {"role": "CUSTOMER", "userId": 3, ...}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token süresi dolmuş.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz token.")

# --- Request / Response Modelleri ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

# --- Chat Endpoint ---
@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, user: dict = Depends(verify_token)):
    role = user.get("role", "CUSTOMER")
    user_id = user.get("userId") or user.get("sub")

    reply = await run_agent(
        user_input=req.message,
        user_role=role,
        user_id=user_id
    )
    return ChatResponse(reply=reply)

@app.get("/health")
def health():
    return {"status": "ok"}
