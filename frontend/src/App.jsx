import { useEffect, useState } from "react";
import "./App.css";

function App() {

  const [selectedCompany, setSelectedCompany] = useState("Infosys");

  const [question, setQuestion] = useState("");

  const [response, setResponse] = useState("");

  const [loading, setLoading] = useState(false);

  const [memoryLoading, setMemoryLoading] = useState(false);

  const [memories, setMemories] = useState([]);

  const [error, setError] = useState("");


  // =========================
  // COMPANIES
  // =========================

  const companies = [
    "Infosys",
    "Microsoft",
    "TCS",
    "Accenture",
    "Wipro"
  ];


  // =========================
  // COMPANY COLORS
  // =========================

  const companyColors = {

    Infosys: {
      primary: "#3781C2",
      light: "#EAF4FB",
      border: "#BFD9EC"
    },

    Microsoft: {
      primary: "#0078D4",
      light: "#E8F4FC",
      border: "#B9DDF5"
    },

    TCS: {
      primary: "#004C8F",
      light: "#E8F1F9",
      border: "#B8CDE0"
    },

    Accenture: {
      primary: "#A100FF",
      light: "#F5E8FF",
      border: "#DDB8FF"
    },

    Wipro: {
      primary: "#351A55",
      light: "#F0EAF5",
      border: "#CDBED9"
    }

  };


  const theme = companyColors[selectedCompany];


  // =========================
  // GET DEAL MEMORY
  // =========================

  const loadMemory = async (company) => {

    setMemoryLoading(true);

    try {

      const url =
        `http://127.0.0.1:8000/deals/${encodeURIComponent(company)}/memory`;

      const result = await fetch(url);

      if (!result.ok) {
        throw new Error("Memory request failed");
      }

      const data = await result.json();

      setMemories(data.memories || []);

    } catch (error) {

      console.error(error);

      setMemories([]);

    } finally {

      setMemoryLoading(false);

    }

  };


  // =========================
  // LOAD MEMORY WHEN COMPANY CHANGES
  // =========================

  useEffect(() => {

    loadMemory(selectedCompany);

  }, [selectedCompany]);


  // =========================
  // NAVIGATION
  // =========================

  const handleNavigation = (section) => {

    if (section === "Deals") {

      document
        .getElementById("deal-section")
        ?.scrollIntoView({
          behavior: "smooth"
        });

    }


    if (section === "Memory") {

      document
        .getElementById("memory-section")
        ?.scrollIntoView({
          behavior: "smooth"
        });

    }

  };


  // =========================
  // FIND MEMORY INFORMATION
  // =========================

  const findMemoryByKeywords = (keywords) => {

    const matches = memories.filter((memory) => {

      const text = memory.toLowerCase();

      return keywords.some((keyword) =>
        text.includes(keyword)
      );

    });

    return matches;

  };


  // =========================
  // CURRENT DEAL INFORMATION
  // =========================

  const dealInformation = {

    interest: findMemoryByKeywords([
      "interest",
      "interested",
      "evaluating",
      "evaluation",
      "considering",
      "looking for"
    ]),

    concerns: findMemoryByKeywords([
      "concern",
      "concerns",
      "issue",
      "problem",
      "worried",
      "security",
      "privacy",
      "pricing",
      "price",
      "cost",
      "timeline",
      "support"
    ]),

    requirements: findMemoryByKeywords([
      "requirement",
      "requirements",
      "required",
      "needs",
      "requested",
      "implementation",
      "integration",
      "information"
    ]),

    pricing: findMemoryByKeywords([
      "pricing",
      "price",
      "cost",
      "budget"
    ]),

    competitors: findMemoryByKeywords([
      "competitor",
      "competitors"
    ]),

    stakeholders: findMemoryByKeywords([
      "stakeholder",
      "stakeholders",
      "involving",
      "decision maker"
    ]),

    nextSteps: findMemoryByKeywords([
      "next step",
      "next steps",
      "follow-up",
      "follow up",
      "review",
      "meeting",
      "evaluation",
      "continue"
    ])

  };


  // =========================
  // ASK AGENT
  // =========================

  const handleAsk = async () => {

    if (!question.trim()) {

      setResponse(
        "Please enter a question for the Deal Agent."
      );

      return;

    }


    setLoading(true);

    setError("");

    setResponse("");


    try {

      const url =
        `http://127.0.0.1:8000/deals/${encodeURIComponent(selectedCompany)}/ask?question=${encodeURIComponent(question)}`;

      const result = await fetch(url);

      if (!result.ok) {
        throw new Error("Backend request failed");
      }

      const data = await result.json();

      setResponse(data.answer);

    } catch (error) {

      console.error(error);

      setError(
        "Could not connect to the Deal Intelligence Agent."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================
  // QUICK ACTIONS
  // =========================

  const handleAction = async (action) => {

    let generatedQuestion = "";


    // =========================
    // BRIEF ME
    // =========================

    if (action === "brief") {

      generatedQuestion =
        `Give me a brief summary of the ${selectedCompany} deal. ` +
        `Include customer interest, concerns, requirements, ` +
        `pricing, competitors, stakeholders, and important ` +
        `previous interactions.`;

    }


    // =========================
    // OBJECTIONS
    // =========================

    if (action === "objections") {

      generatedQuestion =
        `What objections and concerns has ${selectedCompany} ` +
        `raised in the deal history? Explain the important ` +
        `concerns and what information is needed to address them.`;

    }


    // =========================
    // PREPARE FOR CALL
    // =========================

    if (action === "call") {

      generatedQuestion =
        `Prepare me for my next call with ${selectedCompany}. ` +
        `Summarize the important deal history, concerns, ` +
        `requirements, stakeholders, pricing discussions, ` +
        `and things I should be prepared to discuss.`;

    }


    // =========================
    // WHAT WORKED BEFORE
    // =========================

    if (action === "past") {

      generatedQuestion =
        `What relevant approaches from previous deals ` +
        `could help with the current ${selectedCompany} deal?`;

    }


    setQuestion(generatedQuestion);

    setLoading(true);

    setError("");

    setResponse("");


    try {

      let url;


      if (action === "past") {

        url =
          `http://127.0.0.1:8000/deals/${encodeURIComponent(selectedCompany)}/historical-learning`;

      } else {

        url =
          `http://127.0.0.1:8000/deals/${encodeURIComponent(selectedCompany)}/ask?question=${encodeURIComponent(generatedQuestion)}`;

      }


      const result = await fetch(url);


      if (!result.ok) {
        throw new Error("Backend request failed");
      }


      const data = await result.json();

      setResponse(data.answer);

    } catch (error) {

      console.error(error);

      setError(
        "Could not connect to the Deal Intelligence Agent."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================
  // CHANGE COMPANY
  // =========================

  const changeCompany = (company) => {

    setSelectedCompany(company);

    setQuestion("");

    setResponse("");

    setError("");

  };


  // =========================
  // RENDER MEMORY ITEM
  // =========================

  const renderMemoryItems = (items) => {

    if (items.length === 0) {

      return (
        <div className="empty-info">
          No information available yet.
        </div>
      );

    }


    return items.map((memory, index) => (

      <div
        className="deal-detail"
        key={index}
      >

        {memory}

      </div>

    ));

  };


  // =========================
  // UI
  // =========================

  return (

    <div
      className="app"

      style={{
        "--primary": theme.primary,
        "--company-light": theme.light,
        "--company-border": theme.border
      }}
    >


      {/* =========================
          TOP BAR
      ========================= */}

      <header className="topbar">

        <div className="logo">
          ◈ DEALIQ
        </div>


        <nav>

          <span
            onClick={() =>
              handleNavigation("Deals")
            }
          >
            Deals
          </span>


          <span
            onClick={() =>
              handleNavigation("Memory")
            }
          >
            Memory
          </span>

        </nav>

      </header>


      <div className="main-layout">


        {/* =========================
            SIDEBAR
        ========================= */}

        <aside className="sidebar">

          <h3>
            MY DEALS
          </h3>


          {companies.map((company) => (

            <div
              key={company}

              className={`deal-item ${
                selectedCompany === company
                  ? "selected"
                  : ""
              }`}

              onClick={() =>
                changeCompany(company)
              }

              style={
                selectedCompany === company
                  ? {
                      "--item-color":
                        companyColors[company].primary,

                      "--item-light":
                        companyColors[company].light,

                      "--item-border":
                        companyColors[company].border
                    }
                  : {}
              }
            >

              <div>

                <strong>

                  {selectedCompany === company
                    ? "●"
                    : "○"}{" "}

                  {company}

                </strong>


                <small>
                  Active
                </small>

              </div>

            </div>

          ))}

        </aside>


        {/* =========================
            MAIN CONTENT
        ========================= */}

        <main className="content">


          {/* =========================
              DEAL HEADER
          ========================= */}

          <div
            id="deal-section"
            className="deal-header"
          >

            <p>
              ACTIVE DEAL
            </p>

            <h1>
              {selectedCompany}
            </h1>

            <span className="deal-status">
              ● Active
            </span>

          </div>


          {/* =========================
              AI SECTION
          ========================= */}

          <section className="ai-section">


            {/* =========================
                AI TITLE
            ========================= */}

            <div className="ai-title">

              <div className="ai-icon">
                🤖
              </div>

              <div>

                <h2>
                  Deal Intelligence Agent
                </h2>

                <p>
                  I remember the history of this deal.
                  What would you like help with?
                </p>

              </div>

            </div>


            {/* =========================
                QUESTION BOX
            ========================= */}

            <div className="question-box">

              <textarea
                value={question}

                onChange={(e) =>
                  setQuestion(e.target.value)
                }

                placeholder={
                  `Ask anything about the ${selectedCompany} deal...`
                }
              />


              <button
                onClick={handleAsk}
                disabled={loading}
              >

                {loading
                  ? "Thinking..."
                  : "Ask Agent →"}

              </button>

            </div>


            {/* =========================
                QUICK ACTIONS
            ========================= */}

            <h3 className="section-title">
              QUICK AI ACTIONS
            </h3>


            <div className="actions">


              <button
                onClick={() =>
                  handleAction("brief")
                }

                disabled={loading}
              >

                🧠

                <span>
                  Brief Me
                </span>

              </button>


              <button
                onClick={() =>
                  handleAction("objections")
                }

                disabled={loading}
              >

                ⚠

                <span>
                  Find Objections
                </span>

              </button>


              <button
                onClick={() =>
                  handleAction("call")
                }

                disabled={loading}
              >

                📞

                <span>
                  Prepare For Call
                </span>

              </button>


              <button
                onClick={() =>
                  handleAction("past")
                }

                disabled={loading}
              >

                🏆

                <span>
                  What Worked Before?
                </span>

              </button>


            </div>


            {/* =========================
                RESPONSE
            ========================= */}

            <div className="response-card">

              <div className="card-heading">
                🤖 Agent Response
              </div>


              {loading && (

                <p>
                  🧠 Searching deal memory and
                  generating an answer...
                </p>

              )}


              {!loading &&
                error && (

                <p className="error-text">
                  ⚠ {error}
                </p>

              )}


              {!loading &&
                !error &&
                response && (

                <p
                  style={{
                    whiteSpace: "pre-line"
                  }}
                >
                  {response}
                </p>

              )}


              {!loading &&
                !error &&
                !response && (

                <p>
                  Ask a question or select an AI
                  action to get intelligence about
                  the {selectedCompany} deal.
                </p>

              )}

            </div>


            {/* =========================
                BOTTOM GRID
            ========================= */}

            <div className="bottom-grid">


              {/* =========================
                  CURRENT DEAL
              ========================= */}

              <div className="info-card">

                <div className="card-heading">
                  📊 Current Deal
                </div>


                <div className="deal-category">

                  <h4>
                    Customer Interest
                  </h4>

                  {renderMemoryItems(
                    dealInformation.interest
                  )}

                </div>


                <div className="deal-category">

                  <h4>
                    Concerns
                  </h4>

                  {renderMemoryItems(
                    dealInformation.concerns
                  )}

                </div>


                <div className="deal-category">

                  <h4>
                    Requirements
                  </h4>

                  {renderMemoryItems(
                    dealInformation.requirements
                  )}

                </div>


                <div className="deal-category">

                  <h4>
                    Pricing
                  </h4>

                  {renderMemoryItems(
                    dealInformation.pricing
                  )}

                </div>


                <div className="deal-category">

                  <h4>
                    Competitors
                  </h4>

                  {renderMemoryItems(
                    dealInformation.competitors
                  )}

                </div>

              </div>


              {/* =========================
                  DEAL MEMORY
              ========================= */}

              <div
                className="info-card memory-card"
                id="memory-section"
              >

                <div className="card-heading">
                  🧠 Deal Memory
                </div>


                {memoryLoading && (

                  <div className="memory-loading">

                    Loading {selectedCompany} memory...

                  </div>

                )}


                {!memoryLoading &&
                  memories.length === 0 && (

                  <div className="empty-info">

                    No memories found for{" "}
                    {selectedCompany}.

                  </div>

                )}


                {!memoryLoading &&
                  memories.map((memory, index) => (

                  <div
                    className="memory-item"
                    key={index}
                  >

                    <div className="memory-dot">
                      ●
                    </div>

                    <div>
                      {memory}
                    </div>

                  </div>

                ))}

              </div>

            </div>

          </section>

        </main>

      </div>

    </div>

  );

}

export default App;