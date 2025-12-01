## 🚀 Quick Start Guide - xelochat Consultant AI

### What's New
Your application has been transformed into a **Consultant AI Agent** with voice-based consultation capabilities.

---

## 📋 How to Run Locally

### Step 1: Ensure Dependencies Are Installed
```bash
cd /Users/arunpattnaik/Documents/Projects/NewChat
npm install
```

### Step 2: Set Environment Variables
Create a `.env` file in the project root:
```env
HF_TOKEN=your_huggingface_token_here
PORT=5174
```

Get your free HF_TOKEN from: https://huggingface.co/settings/tokens

### Step 3: Start the Development Server
```bash
PORT=5174 npm run dev
```

### Step 4: Open in Browser
```
http://localhost:5174
```

---

## 🎤 How It Works

### The Flow:
1. **User speaks** into the microphone
2. **Audio → Text**: Speech is converted to text via Web Speech API or Whisper
3. **Text Search**: User query searches the consultant knowledge base
4. **Context Retrieval**: Top 3 relevant knowledge entries are retrieved (expertise, services, case studies)
5. **AI Response**: LLM (Llama-3.1-8B) generates response with consultant context injected
6. **Text → Voice**: Response is converted back to speech via TTS
7. **Avatar Animates**: Dotted avatar shows listening, processing, and speaking states

---

## 📚 Consultant Knowledge Base

Located in: `server/consultant-kb.ts`

Currently includes:
- **Expertise**: 4 areas (Digital Transformation, AI/ML, Cloud, Business Strategy)
- **Services**: 3 services (Strategy, Technical Audit, AI Implementation)
- **Case Studies**: 2 examples (Fortune 500 Migration, AI-Powered Analytics)
- **FAQ**: 3 common questions
- **Process**: 1 engagement walkthrough

### Customize Your Profile
Edit `server/consultant-kb.ts`:

```typescript
export const consultantProfile: ConsultantProfile = {
  name: "Your Name",           // Change this
  title: "Your Title",         // Change this
  bio: "Your bio...",          // Change this
  expertise: ["Area 1", "Area 2", ...],        // Update areas
  services: ["Service 1", "Service 2", ...],   // Update services
  yearsOfExperience: 15,       // Update experience
  languages: ["English", "Hindi"],             // Update languages
  availability: "Mon-Fri, 9 AM - 6 PM EST",   // Update availability
};
```

### Add Knowledge Entries
Add items to the `knowledgeBase` array:

```typescript
{
  id: "unique-id",
  category: "expertise",  // or "service", "case_study", "faq", "process"
  title: "Your Topic",
  content: "Detailed explanation...",
  keywords: ["keyword1", "keyword2"],
  relatedTopics: ["related-id"],
}
```

After editing, **restart the server** for changes to take effect.

---

## 🔌 API Endpoints

### Get Consultant Profile
```bash
curl http://localhost:5174/api/consultant/profile
```

Returns:
```json
{
  "name": "Arun Pattnaik",
  "title": "Senior Technology & Business Consultant",
  "expertise": [...],
  "services": [...],
  ...
}
```

### Send Chat Message
```bash
curl -X POST http://localhost:5174/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Can you help with digital transformation?",
    "conversationHistory": []
  }'
```

Returns:
```json
{
  "message": "AI response text...",
  "audioUrl": "/audio/speech-xyz.flac"
}
```

---

## 🎨 Frontend Components

### New Component
- **`ConsultantProfile`** (`client/src/components/consultant-profile.tsx`)
  - Displays consultant name, title, bio
  - Shows expertise areas as tags
  - Displays experience, services count, languages
  - Shows availability status

### Updated Components
- **`Home`** (`client/src/pages/home.tsx`)
  - Now includes ConsultantProfile section
  - Voice flow enhanced with knowledge search

---

## 📁 File Structure

New/Updated files:
```
server/
  ├── consultant-kb.ts       ← NEW: Knowledge base + profile
  ├── huggingface.ts         ← UPDATED: Knowledge search integration
  └── routes.ts              ← UPDATED: New /api/consultant/profile endpoint

client/src/
  ├── components/
  │   └── consultant-profile.tsx    ← NEW: Profile display component
  └── pages/
      └── home.tsx                   ← UPDATED: Shows consultant profile

README.md                    ← NEW: Complete documentation
QUICK_START.md              ← NEW: This file
```

---

## 🔍 How Knowledge Search Works

When a user asks a question:

1. **Query parsing**: "Can you help with cloud?" → ["can", "help", "cloud"]
2. **Scoring**: Each KB entry scored by:
   - Title match: +10 points
   - Keyword match: +5 points
   - Content match: +2 points
3. **Selection**: Top 3 highest-scoring entries retrieved
4. **Injection**: Retrieved entries injected into AI system prompt
5. **Response**: AI responds with consultant expertise

Example:
```
User: "How do you handle cloud migration?"
↓
Searches KB for: "cloud", "migration", "handle"
↓
Finds: Cloud Architecture entry, Digital Transformation entry, Case Study entry
↓
AI response: "Based on my expertise in cloud migration, here are the best practices..."
↓
Response delivered via voice
```

---

## 🐛 Troubleshooting

### Server won't start
- Check if port 5174 is in use: `lsof -iTCP:5174`
- Kill process: `kill -9 <PID>`
- Or use different port: `PORT=5175 npm run dev`

### No voice output
- Check HF_TOKEN is set and valid
- TTS may be unavailable on free tier (graceful text-only fallback)
- Check browser console for errors

### Consultant profile not showing
- Clear browser cache (Cmd+Shift+R)
- Check console for API errors
- Verify `/api/consultant/profile` endpoint responds

### Poor responses
- Update knowledge base with more relevant entries
- Add more specific keywords to existing entries
- Consider adding related topics for better context

---

## 📊 Project Stats

- **Backend**: Express.js + TypeScript
- **Frontend**: React 18 + TypeScript + Tailwind
- **AI Models**: 
  - Llama-3.1-8B (Chat) - Free, open-source
  - Meta MMS (TTS) - Free, 1000+ languages
  - Whisper Large v3 (Speech Recognition) - Free
- **Database**: Currently in-memory (can add Drizzle for persistence)
- **Deployment**: Ready for production on Node.js runtime

---

## 🎯 Next Steps

1. **Customize consultant profile** - Update name, title, expertise, services
2. **Add more knowledge** - Expand case studies, FAQ, process documentation
3. **Test interactions** - Ask questions about your expertise areas
4. **Deploy** - Push to production (Vercel, Railway, Render, etc.)
5. **Add features** - Consider:
   - Semantic search with embeddings
   - User authentication & conversation history
   - Admin dashboard for knowledge management
   - Calendar integration for bookings
   - Document upload & analysis

---

## 📞 Support

For details, see: `README.md`

---

## ✨ Your Consultant AI is Ready!

The system is now a full-featured AI consultant that:
- ✅ Takes voice input
- ✅ Converts to text
- ✅ Searches your knowledge base
- ✅ Generates context-aware responses
- ✅ Converts back to voice
- ✅ Displays your profile

Start by running `PORT=5174 npm run dev` and opening http://localhost:5174 in your browser!
