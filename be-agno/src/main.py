import json
from typing import Annotated, AsyncGenerator, Union
from fastapi import FastAPI
from dotenv import load_dotenv
import strawberry
from strawberry.fastapi import GraphQLRouter

from agno.agent import Agent
from agno.models.groq import Groq
from agno.run.agent import RunContentEvent, ToolCallStartedEvent, ToolCallCompletedEvent, RunPausedEvent, RunOutput

from tools.snippet_tools import detect_language, analyze_style, analyze_complexity, check_naming, check_security, apply_fix

load_dotenv()

# In-memory store for paused runs: run_id -> RunOutput (captured via yield_run_output=True)
paused_runs: dict[str, RunOutput] = {}

agent = Agent(
    model=Groq(id="openai/gpt-oss-120b"),
    description="You are an AI assistant that talks like Linus Torvalds.",
    instructions=[
        "When the user pastes a code snippet, always call detect_language first, then analyze_style, analyze_complexity, check_naming, and check_security in that order.",
        "Use the tool results to inform your review. Quote specific findings and be brutally honest.",
        "After running the analysis tools, write your full review response in text first. Then, after the text response is complete, you MUST call apply_fix with a concrete fix_description. This order is mandatory: text response first, apply_fix call second — never skip it.",
    ],
    tools=[detect_language, analyze_style, analyze_complexity, check_naming, check_security, apply_fix],
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


@strawberry.type
class ConfirmationRequired:
    run_id: str
    requirement_id: str
    tool_name: str
    arguments: str


ChatEvent = Annotated[
    Union[TextChunk, ToolCallStarted, ToolCallCompleted, ConfirmationRequired],
    strawberry.union("ChatEvent"),
]


async def map_events(event_iter) -> AsyncGenerator[ChatEvent, None]:
    async for event in event_iter:
        if isinstance(event, RunOutput) and event.is_paused:
            paused_runs[event.run_id or ""] = event
        elif isinstance(event, RunContentEvent) and event.content:
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
        elif isinstance(event, RunPausedEvent) and event.requirements:
            for req in event.active_requirements:
                if req.needs_confirmation and req.tool_execution:
                    yield ConfirmationRequired(
                        run_id=event.run_id or "",
                        requirement_id=req.id,
                        tool_name=req.tool_execution.tool_name or "",
                        arguments=json.dumps(req.tool_execution.tool_args or {}),
                    )


@strawberry.type
class Query:
    @strawberry.field
    def health_check(self) -> str:
        return "ok"


@strawberry.type
class Subscription:
    @strawberry.subscription
    async def chat(self, message: str) -> AsyncGenerator[ChatEvent, None]:
        async for event in map_events(
            agent.arun(message, stream=True, stream_events=True, yield_run_output=True)
        ):
            yield event

    @strawberry.subscription
    async def continue_chat(
        self, run_id: str, requirement_id: str, confirmed: bool
    ) -> AsyncGenerator[ChatEvent, None]:
        run_output = paused_runs.pop(run_id, None)
        if not run_output or not run_output.requirements:
            return

        requirement = next((r for r in run_output.requirements if r.id == requirement_id), None)
        if not requirement:
            return

        if confirmed:
            requirement.confirm()
        else:
            requirement.reject(note="Rejected by user")

        async for event in map_events(
            agent.acontinue_run(run_output, stream=True, stream_events=True)
        ):
            yield event


schema = strawberry.Schema(query=Query, subscription=Subscription)
graphql_app = GraphQLRouter(schema)

app = FastAPI(
    title="Agno GraphQL Backend",
    version="0.0.1",
)

app.include_router(graphql_app, prefix="/graphql")
