from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from hindsight_service import remember, recall
from llm_service import generate_answer, extract_deal_information


app = FastAPI()


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# HOME
# =========================

@app.get("/")
def home():

    return {
        "message": "Deal Intelligence Agent is running"
    }


# =========================
# STORE INTERACTION
# =========================

@app.post("/deals/{company}/interactions")
def add_interaction(
    company: str,
    interaction: str
):

    content = f"""
    Company: {company}

    Interaction:
    {interaction}
    """

    result = remember(content)

    return {
        "message": "Interaction stored successfully",
        "company": company,
        "result": str(result)
    }


# =========================
# PROCESS EMAIL
# =========================

@app.post("/deals/{company}/email")
def add_email(
    company: str,
    email: str
):

    # Extract useful deal information using Groq
    deal_information = extract_deal_information(email)

    # Store extracted information in Hindsight
    content = f"""
    Company: {company}

    Deal Information:
    {deal_information}

    Source:
    Email
    """

    result = remember(content)

    return {
        "message": "Email processed successfully",
        "company": company,
        "extracted_information": deal_information,
        "result": str(result)
    }


# =========================
# ASK ABOUT DEAL
# =========================

@app.get("/deals/{company}/ask")
def ask_about_deal(
    company: str,
    question: str
):

    # Create a company-specific recall query
    query = f"""
    Company: {company}

    Question: {question}
    """

    # Retrieve memories from Hindsight
    result = recall(query)

    # Keep only memories belonging to this company
    memories = [
        memory.text
        for memory in result.results
        if company.lower() in memory.text.lower()
    ]

    # Give memories + question to Groq
    answer = generate_answer(
        question,
        memories
    )

    return {
        "company": company,
        "question": question,
        "answer": answer,
        "memories": memories
    }


# =========================
# GET DEAL MEMORY
# =========================

@app.get("/deals/{company}/memory")
def get_deal_memory(company: str):

    query = f"""
    Company: {company}

    Give me all important information about this deal:
    customer interest, concerns, requirements,
    pricing, competitors, stakeholders, and next steps.
    """

    # Retrieve memories from Hindsight
    result = recall(query)

    # Keep only memories belonging to this company
    memories = [
        memory.text
        for memory in result.results
        if company.lower() in memory.text.lower()
    ]

    return {
        "company": company,
        "memories": memories
    }


# =========================
# HISTORICAL DEAL LEARNING
# =========================

@app.get("/deals/{company}/historical-learning")
def historical_learning(company: str):

    # Search Hindsight for previous deals
    query = """
    Find previous customer deals and interactions.

    Look for:
    - Customer objections
    - Problems or concerns
    - Approach used by the sales representative
    - Outcome of the deal
    - Previous customer experiences

    Return information from previous deals that could
    be useful for understanding how objections were handled.
    """

    result = recall(query)

    # Get all memories returned by Hindsight
    historical_memories = [
        memory.text
        for memory in result.results
    ]

    # Ask Groq to analyze the historical memories
    answer = generate_answer(
        f"""
        We are currently working on the {company} deal.

        Analyze the previous deal experiences below.

        Identify:

        1. Previous customer objection
        2. Approach that was used
        3. Outcome
        4. How that historical example may be relevant
           to the current {company} deal

        Only use information present in the memories.
        Do not invent information.

        Previous deal memories:
        {historical_memories}
        """,
        historical_memories
    )

    return {
        "company": company,
        "historical_memories": historical_memories,
        "answer": answer
    }