/**
 * Consultant Knowledge Base
 * Stores expertise, services, case studies, and FAQ for RAG (Retrieval-Augmented Generation)
 */

export interface ConsultantProfile {
  name: string;
  title: string;
  bio: string;
  expertise: string[];
  services: string[];
  yearsOfExperience: number;
  languages: string[];
  availability: string;
}

export interface KnowledgeEntry {
  id: string;
  category: string; // "expertise" | "service" | "case_study" | "faq" | "process"
  title: string;
  content: string;
  keywords: string[]; // For search
  relatedTopics: string[];
}

// Consultant Profile
export const consultantProfile: ConsultantProfile = {
  // The consultant profile is the assistant persona. Use the bot name here.
  name: "xelo",
  title: "Senior Technology & Business Consultant",
  bio: "Experienced consultant specializing in digital transformation, AI/ML implementation, and business strategy. 10+ years helping companies scale and innovate.",
  expertise: [
    "Digital Transformation",
    "AI & Machine Learning",
    "Cloud Architecture",
    "Business Strategy",
    "Product Development",
    "Startup Growth",
    "Enterprise Solutions"
  ],
  services: [
    "Strategy Consulting",
    "Technical Audit",
    "AI Implementation",
    "Architecture Design",
    "Team Building",
    "Growth Hacking",
    "Process Optimization"
  ],
  yearsOfExperience: 10,
  languages: ["English", "Hindi"],
  availability: "Available for consultations Mon-Fri, 9 AM - 6 PM EST"
};

// Knowledge Base Entries
export const knowledgeBase: KnowledgeEntry[] = [
  // Expertise entries
  {
    id: "exp-1",
    category: "expertise",
    title: "Digital Transformation Strategy",
    content: `Digital transformation is the integration of digital technology into all areas of business operations. I help organizations:
    - Assess current digital maturity
    - Develop comprehensive transformation roadmaps
    - Implement cloud-first strategies
    - Modernize legacy systems
    - Build data-driven decision processes
    - Enhance customer experience through digital channels`,
    keywords: ["digital transformation", "modernization", "cloud", "digital strategy", "technology"],
    relatedTopics: ["cloud-architecture", "process-optimization", "team-building"]
  },
  {
    id: "exp-2",
    category: "expertise",
    title: "AI & Machine Learning Implementation",
    content: `I specialize in practical AI/ML implementation for business value:
    - Identifying high-impact use cases for AI
    - Data strategy and governance
    - Model development and deployment
    - MLOps and model monitoring
    - AI ethics and responsible AI practices
    - Building in-house data science capabilities
    - From proof-of-concept to production systems`,
    keywords: ["AI", "machine learning", "ML", "deep learning", "neural networks", "data science", "models"],
    relatedTopics: ["technical-audit", "team-building", "product-development"]
  },
  {
    id: "exp-3",
    category: "expertise",
    title: "Cloud Architecture & Migration",
    content: `Expert guidance on cloud infrastructure and migration:
    - Multi-cloud and hybrid cloud strategies
    - AWS, Google Cloud, Azure expertise
    - Microservices and serverless architecture
    - Database design and optimization
    - Security and compliance in cloud
    - Cost optimization and resource management
    - High availability and disaster recovery`,
    keywords: ["cloud", "AWS", "Azure", "GCP", "infrastructure", "migration", "microservices", "serverless"],
    relatedTopics: ["digital-transformation", "technical-audit", "process-optimization"]
  },
  {
    id: "exp-4",
    category: "expertise",
    title: "Business Strategy & Growth",
    content: `Develop winning strategies and accelerate growth:
    - Market analysis and competitive positioning
    - Business model innovation
    - Go-to-market strategy
    - Revenue optimization
    - Scaling operations efficiently
    - Stakeholder alignment
    - KPI definition and tracking`,
    keywords: ["strategy", "growth", "business model", "market", "revenue", "scaling", "gtm"],
    relatedTopics: ["startup-growth", "product-development", "process-optimization"]
  },

  // Service entries
  {
    id: "svc-1",
    category: "service",
    title: "Strategy Consulting",
    content: `Develop comprehensive strategies for growth and transformation:
    - Duration: 4-12 weeks
    - Deliverables: Strategy document, implementation roadmap, financial projections
    - Ideal for: Enterprises planning transformation, startups seeking direction
    - Includes: Market research, competitive analysis, stakeholder interviews, scenario planning`,
    keywords: ["strategy", "consulting", "planning", "roadmap", "analysis"],
    relatedTopics: ["business-strategy", "startup-growth"]
  },
  {
    id: "svc-2",
    category: "service",
    title: "Technical Audit & Assessment",
    content: `Comprehensive evaluation of your technology stack:
    - Duration: 2-4 weeks
    - Deliverables: Audit report, risk assessment, improvement recommendations
    - Covers: Architecture review, security assessment, performance analysis, tech debt evaluation
    - Outcome: Clear understanding of current state and optimization opportunities`,
    keywords: ["technical audit", "assessment", "code review", "security", "performance"],
    relatedTopics: ["cloud-architecture", "digital-transformation"]
  },
  {
    id: "svc-3",
    category: "service",
    title: "AI/ML Implementation Support",
    content: `End-to-end support for AI/ML projects:
    - Duration: 3-9 months (depending on scope)
    - Includes: Use case identification, data strategy, model development, deployment, monitoring
    - Team support: Help build or augment your data science team
    - Governance: Establish MLOps practices and model governance`,
    keywords: ["AI", "machine learning", "implementation", "support", "team"],
    relatedTopics: ["ai-expertise", "team-building", "technical-audit"]
  },

  // Case Studies
  {
    id: "case-1",
    category: "case_study",
    title: "Fortune 500 Cloud Migration",
    content: `Client: Large financial services company
    Challenge: Legacy on-premises infrastructure limiting growth
    Solution: Designed and executed multi-year cloud migration strategy
    Results: 40% reduction in infrastructure costs, 60% faster deployment cycles, improved disaster recovery
    Duration: 18 months engagement
    Key Learning: Phased approach with strong change management is critical for large orgs`,
    keywords: ["migration", "cloud", "enterprise", "finance", "cost savings"],
    relatedTopics: ["cloud-architecture", "digital-transformation"]
  },
  {
    id: "case-2",
    category: "case_study",
    title: "AI-Powered Customer Analytics Platform",
    content: `Client: E-commerce startup (Series A)
    Challenge: Need for data-driven customer insights to compete
    Solution: Built ML pipeline for customer segmentation and churn prediction
    Results: 25% improvement in retention, 35% increase in targeted revenue, 3x ROI
    Duration: 6 months to MVP, ongoing optimization
    Key Learning: Focus on business outcomes, not just model accuracy`,
    keywords: ["AI", "ML", "startup", "analytics", "customer", "retention"],
    relatedTopics: ["ai-expertise", "product-development", "startup-growth"]
  },

  // FAQ
  {
    id: "faq-1",
    category: "faq",
    title: "What's your typical engagement model?",
    content: `I offer flexible engagement models:
    - Hourly consulting for short-term advice
    - Fixed project fees for defined scopes
    - Retainer arrangements for ongoing support
    - Equity arrangements for promising startups
    Most engagements start with an initial scoping call to align on objectives and timeline.`,
    keywords: ["engagement", "pricing", "model", "how", "terms"],
    relatedTopics: ["services", "availability"]
  },
  {
    id: "faq-2",
    category: "faq",
    title: "How do you work with distributed teams?",
    content: `I'm experienced with remote collaboration:
    - Regular sync meetings via video conference
    - Asynchronous documentation and updates
    - Direct Slack/email support
    - Flexible timezone accommodation
    - Can work fully remote or on-site depending on needs
    Many of my recent engagements have been fully remote with excellent outcomes.`,
    keywords: ["remote", "distributed", "team", "collaboration", "work"],
    relatedTopics: ["team-building", "availability"]
  },
  {
    id: "faq-3",
    category: "faq",
    title: "What industries do you specialize in?",
    content: `I've worked across multiple sectors:
    - Financial Services & FinTech
    - E-commerce & Retail
    - Healthcare & MedTech
    - SaaS & Software
    - Manufacturing & Industrial
    - Media & Entertainment
    While I have deep experience in these areas, my core methodologies apply across industries.`,
    keywords: ["industry", "sectors", "fintech", "saas", "healthcare"],
    relatedTopics: ["expertise", "case-studies"]
  },

  // Process
  {
    id: "proc-1",
    category: "process",
    title: "Typical Engagement Process",
    content: `My standard approach for consulting engagements:
    1. Discovery Call (30 min): Understand your challenge and goals
    2. Proposal & Agreement (1 week): Define scope, timeline, deliverables, pricing
    3. Kick-off (Week 1): Detailed planning and team alignment
    4. Execution (Weeks 2-N): Regular check-ins, iterative progress
    5. Delivery (Final week): Present findings, recommendations, handoff
    6. Follow-up (Optional): Ongoing support or implementation assistance`,
    keywords: ["process", "engagement", "how it works", "steps", "timeline"],
    relatedTopics: ["services", "engagement-model"]
  }
];

/**
 * Simple keyword-based search through the knowledge base
 * Returns relevant entries sorted by relevance
 */
export function searchKnowledgeBase(query: string, limit: number = 3): KnowledgeEntry[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  const scored = knowledgeBase.map(entry => {
    let score = 0;

    // Score based on keyword matches
    queryTerms.forEach(term => {
      if (entry.title.toLowerCase().includes(term)) score += 10;
      if (entry.keywords.some(k => k.toLowerCase().includes(term))) score += 5;
      if (entry.content.toLowerCase().includes(term)) score += 2;
    });

    return { entry, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.entry);
}

/**
 * Get context-enhanced system prompt for the consultant AI
 * Includes consultant info and optionally searched knowledge
 */
export function getConsultantSystemPrompt(relevantKnowledge?: KnowledgeEntry[]): string {
  let prompt = `You are ${consultantProfile.name}, a ${consultantProfile.title}.

About me:
${consultantProfile.bio}

My expertise areas:
${consultantProfile.expertise.map(e => `- ${e}`).join('\n')}

My services:
${consultantProfile.services.map(s => `- ${s}`).join('\n')}

${consultantProfile.availability}

Conversation guidelines:
- Be professional but friendly and conversational
- Draw from your expertise and experience
- Provide actionable advice and insights
- Keep responses concise (2-3 sentences) for voice conversation
- If asked about services or expertise, reference your background
- Be honest about limitations and suggest further support when needed`;

  if (relevantKnowledge && relevantKnowledge.length > 0) {
    prompt += `\n\nRelevant context from your knowledge base:\n`;
    relevantKnowledge.forEach(entry => {
      prompt += `\n[${entry.title}]\n${entry.content}\n`;
    });
  }

  return prompt;
}
