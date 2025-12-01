/**
 * Mock/Sample Responses for Development
 * Used when HuggingFace token is not available or for testing
 */

const sampleResponses = [
  {
    keywords: ["hello", "hi", "hey", "greetings"],
    response: "Hello! That's an interesting question. Let me get more information from our resources to give you the best answer.",
  },
  {
    keywords: ["digital transformation", "modernize", "legacy"],
    response: "That's an interesting question. Let me get more info from web and our expertise database. Digital transformation is crucial for modern businesses.",
  },
  {
    keywords: ["ai", "machine learning", "ml", "neural"],
    response: "That's an interesting question. Let me search our knowledge base and recent industry data. AI and machine learning are transformative technologies.",
  },
  {
    keywords: ["cloud", "aws", "azure", "gcp", "migration"],
    response: "That's an interesting question. Let me get more details from our cloud architecture database. Cloud infrastructure is essential today.",
  },
  {
    keywords: ["strategy", "business", "growth", "scaling"],
    response: "That's an interesting question. Let me analyze that with our strategic insights. Building a scalable business strategy is critical.",
  },
  {
    keywords: ["cost", "pricing", "rate", "fee", "budget"],
    response: "That's an interesting question. Let me get the current information. Our engagement models are flexible and tailored to your needs.",
  },
  {
    keywords: ["project", "case study", "portfolio", "experience"],
    response: "That's an interesting question. Let me pull up our case study library. We have extensive experience across multiple industries.",
  },
  {
    keywords: ["timeline", "duration", "how long", "when"],
    response: "That's an interesting question. Let me gather the relevant details. Project timelines vary based on scope and complexity.",
  },
  {
    keywords: ["team", "process", "method", "approach"],
    response: "That's an interesting question. Let me share our methodology and team structure details from our documentation.",
  },
  {
    keywords: ["contact", "reach", "connect", "email", "phone"],
    response: "That's an interesting question. Let me get our contact information for you. We're available through multiple channels.",
  },
];

const fallbackResponses = [
  "That's an interesting question. Let me get more information from our resources.",
  "That's a great inquiry. Let me search through our knowledge base for relevant details.",
  "That's something I should research more thoroughly. Let me get the latest information.",
  "That's a thoughtful question. Let me gather more data to give you the best answer.",
  "That's definitely worth exploring. Let me pull up the relevant information.",
];

/**
 * Get a sample/mock response based on user input
 * Matches keywords to select appropriate response template
 */
export function getMockResponse(userMessage: string): string {
  const messageLower = userMessage.toLowerCase();

  // Try to find a matching response based on keywords
  for (const sample of sampleResponses) {
    for (const keyword of sample.keywords) {
      if (messageLower.includes(keyword)) {
        return sample.response;
      }
    }
  }

  // Return a random fallback response if no keywords match
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

/**
 * Get multiple mock responses for variation
 */
export function getRandomMockResponse(): string {
  const allResponses = [
    ...sampleResponses.map(s => s.response),
    ...fallbackResponses,
  ];
  return allResponses[Math.floor(Math.random() * allResponses.length)];
}
