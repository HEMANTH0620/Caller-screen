
export const stages = [
  {
    number: 1,
    name: "Opening",
    purpose:
      "Reach the right person, introduce yourself, and confirm that your contact information is correct.",
    examples: [
      "Who is calling?",
      "I no longer work at that company.",
      "You have reached the wrong person.",
      "You should speak to someone else."
    ],
    outcomes: [
      "Right person reached",
      "Wrong person or number",
      "Person moved company",
      "Different decision maker"
    ]
  },
  {
    number: 2,
    name: "Purpose",
    purpose:
      "Explain clearly why Meridian Growth Partners is calling, what its growth work involves, and why the conversation may be relevant to the prospect's company.",
    examples: [
      "What exactly does your company do?",
      "What is this growth report?",
      "What will I get from the report?",
      "What happens after you send it?"
    ],
    outcomes: [
      "Asked what we do or offer",
      "Asked about the report's value",
      "Asked about charges or business model",
      "Asked for company details or proof"
    ]
  },
  {
    number: 3,
    name: "Permission",
    purpose:
      "Find out whether the prospect is willing and available to continue. If they are busy, agree on a practical callback instead of pushing ahead.",
    examples: [
      "Yes, go ahead.",
      "Keep it quick, I have other work.",
      "I am busy. Can you call later?",
      "Call me next week."
    ],
    outcomes: [
      "Permission granted",
      "Only a short conversation possible",
      "Callback requested",
      "Declined to continue"
    ]
  },
  {
    number: 4,
    name: "Their business",
    purpose:
      "Understand what the company does, how it operates, and whether the prospect's role connects to the growth questions being discussed.",
    examples: [
      "We are primarily a manufacturing company.",
      "That function is handled by another team.",
      "You should speak to our company leadership.",
      "Our global team handles these decisions."
    ],
    outcomes: [
      "Business and role explained",
      "Different decision maker",
      "Different department or function",
      "Company-level versus department-level mismatch"
    ]
  },
  {
    number: 5,
    name: "Their need, in their words",
    purpose:
      "Listen for the prospect's own description of their growth goals, operational challenges, and constraints. Record their words rather than replacing them with your interpretation.",
    examples: [
      "We need more skilled manpower.",
      "Frequent reorganisations keep changing our goals.",
      "We want to increase revenue and profitability.",
      "We want to develop new products using our existing facilities."
    ],
    outcomes: [
      "Growth goal identified",
      "Operational challenge identified",
      "No current constraint identified",
      "Need unclear or not shared"
    ]
  },
  {
    number: 6,
    name: "Objection",
    purpose:
      "Understand what is stopping the prospect from moving forward. Listen to the reason, clarify it, and respond without pressuring them.",
    examples: [
      "We already have an internal team.",
      "We work with global consultants.",
      "We cannot share confidential information.",
      "I do not understand how this would help us."
    ],
    outcomes: [
      "Existing internal team or process",
      "Existing consultant or global agreement",
      "Confidentiality or information concern",
      "Unclear value or no current need"
    ]
  },
  {
    number: 7,
    name: "Next step",
    purpose:
      "Agree on one specific next action, including the channel or timing. Distinguish genuine commitment from a polite agreement to receive information.",
    examples: [
      "Send the report to my official email.",
      "You can share it on WhatsApp.",
      "Call me next Tuesday morning.",
      "Arrange a meeting with your founder."
    ],
    outcomes: [
      "Report or information requested",
      "Email or WhatsApp agreed",
      "Specific callback agreed",
      "Meeting or further discussion agreed"
    ]
  },
  {
    number: 8,
    name: "Close",
    purpose:
      "End the conversation clearly and record what actually happened: the prospect's decision, the agreed next action, and their words from Stage 5.",
    examples: [
      "Send the details and I will review them.",
      "Call me next Monday.",
      "We already have this covered.",
      "Please do not call again."
    ],
    outcomes: [
      "Next step confirmed",
      "Follow-up required",
      "Declined or not interested",
      "No agreement or call ended unexpectedly"
    ]
  }
];

export const callOutcomes = [
  "Agreed to receive report",
  "Next step agreed",
  "Interested",
  "Follow-up",
  "Call again",
  "Not interested",
  "Do not call",
  "Wrong person",
  "Moved company",
  "No outcome recorded"
];