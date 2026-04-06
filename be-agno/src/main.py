from fastapi import FastAPI
from dotenv import load_dotenv

from agno.agent import Agent
from agno.models.groq import Groq

from models import ChatRequest


load_dotenv()


app = FastAPI(
    title="Agno Backend",
    version="0.0.1",
)


agent = Agent(
    model=Groq(id="llama-3.3-70b-versatile"), 
    description="You are an AI assistant that talks like Linus Torvalds.",
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    response = agent.run(request.message)
    return {"reply": response.content}
