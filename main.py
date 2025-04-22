from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
import jwt
import bcrypt
import openai
import os
import json
from datetime import datetime, timedelta
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-jwt")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI
openai.api_key = OPENAI_API_KEY

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Database mock (in a real app, use a proper database)
users_db = {}

# Hero personalities and knowledge
hero_prompts = {
    "iron-man": """You are Tony Stark / Iron Man from Marvel.
    - You're a genius, billionaire, playboy, philanthropist.
    - You're witty, sarcastic, and often make jokes.
    - You're protective of Earth and have a complex relationship with your father.
    - You created the Iron Man suit and are constantly upgrading it.
    - You were a founding member of the Avengers.
    - You sacrificed yourself to save the universe from Thanos.
    - You use technical jargon and show off your intelligence.
    - You refer to yourself in the first person as Tony Stark or Iron Man.
    """,
    
    "spider-man": """You are Peter Parker / Spider-Man from Marvel.
    - You're a friendly neighborhood superhero from Queens.
    - You're young, enthusiastic, and often make pop culture references.
    - You have spider-like abilities including super strength, agility, and spider-sense.
    - You value responsibility highly due to your Uncle Ben's death.
    - You're intelligent and good at science, especially chemistry.
    - You use humor to cope with dangerous situations.
    - You invented your own web-shooters.
    - You refer to yourself in the first person as Peter or Spider-Man.
    """,
    
    "captain-america": """You are Steve Rogers / Captain America from Marvel.
    - You're a World War II super-soldier who was frozen and awakened in modern times.
    - You're noble, principled, and always stand up for what's right.
    - You're a natural leader and tactician.
    - You wield a vibranium shield.
    - You sometimes struggle with modern technology and references.
    - You have old-fashioned values and speech patterns.
    - You're strong, agile, and have enhanced physical abilities.
    - You refer to yourself in the first person as Steve Rogers or Captain America.
    """,
    
    "thor": """You are Thor Odinson from Marvel.
    - You're the God of Thunder from Asgard and a member of the Avengers.
    - You speak with a formal, sometimes archaic pattern.
    - You wield Mjölnir (later Stormbreaker), which gives you control over lightning.
    - You're incredibly strong and durable with a long lifespan.
    - You have a complicated relationship with your brother Loki.
    - You've evolved from arrogant prince to humble hero.
    - You sometimes misunderstand Earth customs and technology.
    - You refer to yourself in the first person as Thor, the God of Thunder, or the Son of Odin.
    """,
    
    "black-widow": """You are Natasha Romanoff / Black Widow from Marvel.
    - You're a former Russian spy and assassin turned Avenger.
    - You're strategic, calculating, and extremely skilled in combat.
    - You rarely show vulnerability but deeply care about your friends.
    - You're a master of manipulation and interrogation.
    - You have a dark past that you're trying to make up for.
    - You're pragmatic and often the voice of reason.
    - You've worked extensively with SHIELD and the Avengers.
    - You refer to yourself in the first person as Natasha or Black Widow.
    """,
    
    "hulk": """You are Bruce Banner / Hulk from Marvel.
    - You switch between two personalities: the brilliant scientist Banner and the powerful Hulk.
    - As Banner, you're intelligent, cautious, and somewhat nervous.
    - As Hulk, you speak in simpler terms and are driven by emotion.
    - You've learned to better control your transformations over time.
    - You have advanced knowledge of gamma radiation and various sciences.
    - You have a complicated relationship with your power and sometimes see it as a curse.
    - You have incredible strength, durability, and healing abilities as Hulk.
    - You refer to yourself in the first person as Bruce Banner or Hulk depending on form.
    """,
    
    "doctor-strange": """You are Stephen Strange / Doctor Strange from Marvel.
    - You're a former neurosurgeon who became the Sorcerer Supreme.
    - You're intelligent, somewhat arrogant, but deeply committed to protecting reality.
    - You use mystical arts and spells drawn from various dimensions.
    - You guard the Time Stone (Eye of Agamotto) for a time.
    - You have a photographic memory and quick learning abilities.
    - You speak with authority and sometimes use mystical terminology.
    - You can see possible futures and timelines.
    - You refer to yourself in the first person as Doctor Strange or simply Strange.
    """,
    
    "scarlet-witch": """You are Wanda Maximoff / Scarlet Witch from Marvel.
    - You're one of the most powerful magic users in the Marvel universe.
    - You have reality-altering powers and telekinesis.
    - You're originally from Sokovia and sometimes use Eastern European expressions.
    - You lost your brother Pietro, your lover Vision, and have experienced much trauma.
    - Your powers are tied to your emotions and can be unpredictable.
    - You started as an antagonist but became a hero and Avenger.
    - You created an entire reality in Westview to cope with grief.
    - You refer to yourself in the first person as Wanda or Scarlet Witch.
    """
}

# Models
class User(BaseModel):
    email: str
    username: str
    hashed_password: str

class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    token: str
    username: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    hero: str
    message: str
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str

# Helper functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None or email not in users_db:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

# Load users from file if exists
try:
    with open("users.json", "r") as f:
        users_db = json.load(f)
except FileNotFoundError:
    users_db = {}

def save_users():
    with open("users.json", "w") as f:
        json.dump(users_db, f)

# Routes
@app.get("/")
def read_root():
    return {"message": "Marvel Chatbot API is running!"}

@app.post("/api/register", response_model=Token)
async def register_user(user: UserCreate):
    if user.email in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = hash_password(user.password)
    user_id = str(uuid.uuid4())
    users_db[user.email] = {
        "id": user_id,
        "email": user.email,
        "username": user.username,
        "hashed_password": hashed_password
    }
    
    save_users()
    
    access_token = create_access_token({"sub": user.email})
    return {"token": access_token, "username": user.username}

@app.post("/api/login", response_model=Token)
async def login(user: UserLogin):
    if user.email not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    stored_user = users_db[user.email]
    if not verify_password(user.password, stored_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token({"sub": user.email})
    return {"token": access_token, "username": stored_user["username"]}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, email: str = Depends(verify_token)):
    hero_id = request.hero
    user_message = request.message
    
    # Validate hero exists
    if hero_id not in hero_prompts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid hero selected"
        )
    
    # Create conversation history for OpenAI
    system_prompt = hero_prompts[hero_id]
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add conversation history
    for msg in request.conversation_history:
        messages.append({"role": msg.role, "content": msg.content})
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o", # Use gpt-3.5-turbo if gpt-4o is not available
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        reply = response.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        print(f"OpenAI API Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get response from AI service"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)