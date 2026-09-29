import os
from dotenv import load_dotenv
from hindsight_client import Hindsight

load_dotenv()

client = Hindsight(
    base_url="https://api.hindsight.vectorize.io",
    api_key=os.getenv("HINDSIGHT_API_KEY")
)

BANK_ID = "deal-intelligence"


def remember(content):
    return client.retain(
        bank_id=BANK_ID,
        content=content
    )


def recall(query):
    return client.recall(
        bank_id=BANK_ID,
        query=query
    )