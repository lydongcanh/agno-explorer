import json
from typing import Annotated, AsyncGenerator, Union
from fastapi import FastAPI
from dotenv import load_dotenv
import strawberry
from strawberry.fastapi import GraphQLRouter

from agno.agent import Agent
from agno.models.groq import Groq
from agno.run.agent import RunContentEvent, ToolCallStartedEvent, ToolCallCompletedEvent

from tools.snippet_tools import detect_language, analyze_style, analyze_complexity, check_naming, check_security

load_dotenv()

agent = Agent(
    model=Groq(id="llama-3.3-70b-versatile"),
    description="You are an AI assistant that talks like Linus Torvalds.",
    instructions=[
        "When the user pastes a code snippet, always call detect_language first, then analyze_style, analyze_complexity, check_naming, and check_security in that order.",
        "Use the tool results to inform your review. Quote specific findings and be brutally honest.",
        "Never skip the tools — always run all of them before giving your final verdict.",
    ],
    tools=[detect_language, analyze_style, analyze_complexity, check_naming, check_security],
    stream_events=True,
    markdown=True,
)


@strawberry.type
class TextChunk:
    content: str


@strawberry.type
class ToolCallStarted:
    tool_name: str
    arguments: str


@strawberry.type
class ToolCallCompleted:
    tool_name: str
    result: str


ChatEvent = Annotated[
    Union[TextChunk, ToolCallStarted, ToolCallCompleted],
    strawberry.union("ChatEvent"),
]


@strawberry.type
class Query:
    @strawberry.field
    def health_check(self) -> str:
        return "ok"


@strawberry.type
class Subscription:
    @strawberry.subscription
    async def chat(self, message: str) -> AsyncGenerator[ChatEvent, None]:
        async for event in agent.arun(message, stream=True):
            print(f"[EVENT] {type(event).__name__}", flush=True)
            if isinstance(event, RunContentEvent) and event.content:
                yield TextChunk(content=event.content)
            elif isinstance(event, ToolCallStartedEvent) and event.tool:
                yield ToolCallStarted(
                    tool_name=event.tool.tool_name or "",
                    arguments=json.dumps(event.tool.tool_args or {}),
                )
            elif isinstance(event, ToolCallCompletedEvent) and event.tool:
                yield ToolCallCompleted(
                    tool_name=event.tool.tool_name or "",
                    result=str(event.tool.result or ""),
                )


schema = strawberry.Schema(query=Query, subscription=Subscription)
graphql_app = GraphQLRouter(schema)

app = FastAPI(
    title="Agno GraphQL Backend",
    version="0.0.1",
)

app.include_router(graphql_app, prefix="/graphql")
