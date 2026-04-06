from typing import AsyncGenerator
from fastapi import FastAPI
from dotenv import load_dotenv
import strawberry
from strawberry.fastapi import GraphQLRouter

from agno.agent import Agent
from agno.models.groq import Groq

load_dotenv()

agent = Agent(
    model=Groq(id="llama-3.3-70b-versatile"),
    description="You are an AI assistant that talks like Linus Torvalds.",
)


@strawberry.type
class Query:
    @strawberry.field
    def health_check(self) -> str:
        return "ok"


@strawberry.type
class Subscription:
    @strawberry.subscription
    async def chat(self, message: str) -> AsyncGenerator[str, None]:
        async for chunk in agent.arun(message, stream=True):
            if chunk.content:
                yield chunk.content


schema = strawberry.Schema(query=Query, subscription=Subscription)
graphql_app = GraphQLRouter(schema)

app = FastAPI(
    title="Agno GraphQL Backend",
    version="0.0.1",
)

app.include_router(graphql_app, prefix="/graphql")
