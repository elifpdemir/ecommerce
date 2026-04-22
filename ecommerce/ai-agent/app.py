import chainlit as cl
from agent import run_agent

@cl.on_message
async def main(message: cl.Message):
    response = await run_agent(message.content)
    await cl.Message(content=response).send()
