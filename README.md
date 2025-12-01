# xelochat - AI Consultant Voice Assistant

A sophisticated AI voice conversation platform that functions as an intelligent consultant. Users interact with the system through voice input, which is converted to text, searched against a consultant knowledge base, and answered with context-aware responses delivered via voice output.

## How It Works

### Voice → Text → Search → Response → Voice Flow

1. **Voice Input**: User speaks into the microphone
2. **Transcription**: Audio is converted to text using Web Speech API or Whisper (fallback)
3. **Knowledge Search**: User query is searched against the consultant knowledge base to retrieve relevant expertise, services, and case studies
4. **AI Response**: A language model (Llama-3.1-8B) generates a response, enhanced with consultant context
5. **Voice Output**: Response is converted back to speech using text-to-speech (TTS)
6. **Avatar Animation**: The dotted avatar provides visual feedback (listening, processing, speaking states)

## Features

### 🎤 Voice Interaction
- **Natural Voice Input**: Uses Web Speech API with Whisper fallback for transcription
- **Audio Output**: Text-to-speech synthesis for consultant responses
- **Visual Feedback**: Animated avatar shows listening, processing, and speaking states with lip-sync

### 🤖 Consultant AI Agent
- **Knowledge-Augmented Responses**: Retrieves relevant consultant expertise before generating responses
- **Context-Aware**: Each response is informed by the consultant's background, services, and case studies
- **Conversational**: Maintains conversation history for coherent multi-turn dialogue

### 👤 Consultant Profile
- **Professional Information**: Name, title, bio, years of experience
- **Expertise Areas**: Key specializations (Digital Transformation, AI/ML, Cloud Architecture, etc.)
- **Services Offered**: Specific consulting services available
- **Languages & Availability**: Communication options and consultation hours

### 🎨 User Experience
- **Modern UI**: Clean, professional interface with theme toggle (dark/light)
- **Real-time Transcription Display**: Shows what the system hears
- **Message History**: Full conversation transcript with timestamps
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

### Backend

**`server/consultant-kb.ts`**
- Consultant profile data (name, expertise, services, experience)
- Knowledge base entries (expertise, services, case studies, FAQ, processes)
- Keyword-based search function to retrieve relevant knowledge
- System prompt injection with consultant context

**`server/huggingface.ts`**
- Integration with Hugging Face Inference API
- Models used:
  - **Chat**: `meta-llama/Llama-3.1-8B-Instruct`
  - **TTS**: `facebook/mms-tts-eng`
  - **Speech Recognition**: `openai/whisper-large-v3`
- Enhanced `generateChatResponse()` that searches knowledge base and injects context

**`server/routes.ts`**
- `/api/health` - Health check
- `/api/chat` - Chat endpoint (text input → text + audio response with knowledge search)
- `/api/transcribe` - Audio transcription (fallback for browsers without Web Speech API)
- `/api/consultant/profile` - Retrieve consultant profile information

### Frontend

**`client/src/components/consultant-profile.tsx`**
- Displays consultant profile header with expertise, services, and experience
- Fetches profile from `/api/consultant/profile`
- Shows quick stats and expertise tags

**`client/src/pages/home.tsx`**
- Main application page
- Integrates voice input, consultant profile, avatar, and conversation area
- Orchestrates the voice → text → search → response → voice flow

**UI Components**
- `DottedAvatar`: Animated avatar with state-based animations
- `VoiceButton`: Microphone control with visual feedback
- `ConversationArea`: Message display with user/AI distinction
- `ThemeToggle`: Dark/light mode switcher

### Data Flow

```
User Voice Input
    ↓
Web Speech API / Whisper (Transcription)
    ↓
User Text Message
    ↓
Knowledge Base Search
    ↓
Retrieved Context (expertise, services, case studies)
    ↓
LLM (Llama-3.1-8B) + Context
    ↓
AI Response Text
    ↓
Text-to-Speech (Hugging Face TTS)
    ↓
Audio Response
    ↓
Avatar Animation + Voice Playback
```

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Hugging Face API token (free tier available at https://huggingface.co/settings/tokens)

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your HF_TOKEN to .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:5174` (or your specified PORT)

## Environment Variables

```env
# Required: Hugging Face API token for model access
HF_TOKEN=hf_your_token_here

# Optional: Session management secret
SESSION_SECRET=your_secret_key

# Optional: Port for the server (default: 5000)
PORT=5000
```

## Customizing the Consultant Profile

Edit `server/consultant-kb.ts` to customize:

1. **Consultant Information** (`consultantProfile` object):
   - Name, title, bio
   - Expertise areas
   - Services offered
   - Years of experience
   - Languages
   - Availability

2. **Knowledge Base Entries** (`knowledgeBase` array):
   - Add/edit expertise entries
   - Add/edit service descriptions
   - Add case studies
   - Add FAQ items
   - Add process documentation

Example:
```typescript
export const consultantProfile: ConsultantProfile = {
  name: "Your Name",
  title: "Your Title",
  bio: "Your bio...",
  expertise: ["Expertise 1", "Expertise 2", ...],
  services: ["Service 1", "Service 2", ...],
  // ... more fields
};

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "unique-id",
    category: "expertise", // or "service", "case_study", "faq", "process"
    title: "Topic Title",
    content: "Detailed content about this topic...",
    keywords: ["keyword1", "keyword2"],
    relatedTopics: ["related-id-1"],
  },
  // ... more entries
];
```

## Technology Stack

### Frontend
- **React 18**: Component framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Shadcn UI**: Component library
- **TanStack Query**: State management
- **Wouter**: Routing
- **Framer Motion**: Animations

### Backend
- **Express.js**: Server framework
- **Hugging Face Inference API**: AI models (free tier)
- **Multer**: File upload handling
- **Zod**: Data validation
- **Drizzle ORM**: Database (optional)

### AI Models
- **Llama-3.1-8B-Instruct**: Conversational AI (free, open-source)
- **Meta MMS TTS**: Text-to-speech (free, supports 1000+ languages)
- **OpenAI Whisper Large v3**: Speech-to-text (free, highly accurate)

## How Knowledge Search Works

The system uses **keyword-based search** with relevance scoring:

1. **Query Processing**: User input is split into terms (min 3 characters)
2. **Scoring**: Each knowledge base entry is scored based on:
   - **Title match**: +10 points per matching term
   - **Keyword match**: +5 points per matching term
   - **Content match**: +2 points per matching term
3. **Ranking**: Entries are sorted by score (highest first)
4. **Selection**: Top 3 relevant entries are retrieved
5. **Context Injection**: Retrieved content is injected into the system prompt

This ensures the AI responds with expert knowledge directly relevant to the user's question.

## Example Interactions

### Scenario 1: Expertise Query
```
User: "Can you help with cloud migration?"
→ Search retrieves: Cloud Architecture entry, Digital Transformation entry
→ AI responds with consultant expertise on cloud strategy
→ Response delivered via voice
```

### Scenario 2: Service Inquiry
```
User: "What services do you offer?"
→ Search retrieves: Service entries from knowledge base
→ AI responds with list of available services and engagement model
→ Response delivered via voice
```

### Scenario 3: Case Study Question
```
User: "Tell me about your e-commerce success"
→ Search retrieves: E-commerce case study
→ AI shares relevant project experience
→ Response delivered via voice
```

## Development

### Run in Development Mode
```bash
npm run dev
```

Server will start on `http://localhost:5000` (or your PORT env variable)

### Type Checking
```bash
npm run check
```

### Build for Production
```bash
npm run build
npm start
```

## API Documentation

### POST `/api/chat`
Send a message and get an AI response with voice.

**Request:**
```json
{
  "message": "Can you help with digital transformation?",
  "conversationHistory": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" }
  ]
}
```

**Response:**
```json
{
  "message": "Based on my expertise in digital transformation...",
  "audioUrl": "/audio/speech-xyz.flac"
}
```

### GET `/api/consultant/profile`
Retrieve the consultant's profile information.

**Response:**
```json
{
  "name": "Arun Pattnaik",
  "title": "Senior Technology & Business Consultant",
  "bio": "...",
  "expertise": ["Digital Transformation", "AI & Machine Learning", ...],
  "services": ["Strategy Consulting", "Technical Audit", ...],
  "yearsOfExperience": 10,
  "languages": ["English", "Hindi"],
  "availability": "..."
}
```

### POST `/api/transcribe`
Transcribe audio to text (fallback for browsers without Web Speech API).

**Request:** Multipart form-data with `audio` field

**Response:**
```json
{
  "text": "Can you help with digital transformation?"
}
```

## Limitations & Notes

- **TTS Availability**: Hugging Face free tier has limited TTS providers; app gracefully falls back to text-only responses
- **Latency**: Free tier inference may be slower than commercial APIs
- **Knowledge Base**: Keyword search is simple; consider semantic search (embeddings) for production
- **Authentication**: Currently no user authentication; add for production use
- **Data Storage**: Conversations are not persisted; add database for history
- **Rate Limiting**: No built-in rate limiting; add for production

## Future Enhancements

- **Semantic Search**: Use embeddings for better knowledge retrieval
- **Persistent Storage**: Save conversations and user preferences
- **Authentication**: User accounts and session management
- **Analytics**: Track usage, popular questions, user satisfaction
- **Multi-language**: Support for consultant's available languages
- **Knowledge Management**: Admin dashboard to update knowledge base
- **Scheduled Consultations**: Integration with calendar/booking system
- **Document Upload**: Allow users to upload documents for analysis
- **Custom Integrations**: Connect to CRM, email, Slack, etc.

## License

MIT

## Support

For questions or issues, please open an issue on the repository.
