import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def generate_answer(question, memories):

    prompt = f"""
You are a Deal Intelligence Agent.

Answer the user's question using the deal memories provided below.

User question:
{question}

Deal memories:
{memories}

Give a clear and concise answer.
Do not make up information that is not present in the memories.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content


def extract_deal_information(email):

    prompt = f"""
You are a Deal Intelligence Agent.

Read the following email and extract only useful deal information.

Email:
{email}

Extract:
- Customer interest
- Customer concerns
- Pricing discussion
- Competitors mentioned
- Stakeholder information
- Requirements
- Next steps

Only include information that is actually present in the email.
Do not invent information.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content