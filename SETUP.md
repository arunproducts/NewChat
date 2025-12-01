# Setup & Configuration

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Your Hugging Face API Token

1. Visit https://huggingface.co/settings/tokens
2. Click "New token"
3. Create a token with **at least "read" access**
4. Copy the token

### 3. Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your token:

```env
HF_TOKEN=hf_your_actual_token_here
PORT=5174
```

### 4. Start the Development Server

```bash
npm run dev
```

You should see:
```
8:49:34 PM [express] serving on port 5174
```

### 5. Open in Browser

Visit: **http://localhost:5174**

---

## How to Use

### Simple Voice Interaction

1. **Press the mic button** in the center
2. **Speak your question/command** (e.g., "Can you help with digital transformation?")
3. **Release the mic button** when done
4. **Wait for the response** - you'll hear the AI's voice reply
5. **Your message and response appear** in the chat below

### What Happens Behind the Scenes

```
You speak
    ↓
Audio converted to text
    ↓
Knowledge base searched for relevant context
    ↓
AI generates response using consultant expertise
    ↓
Response converted to voice
    ↓
You hear the answer + see it in chat
```

---

## Customizing the Consultant

Edit `server/consultant-kb.ts` to change:

### Consultant Profile
```typescript
export const consultantProfile: ConsultantProfile = {
  name: "Your Name",
  title: "Your Title",
  bio: "Your bio...",
  expertise: ["Your Area 1", "Your Area 2"],
  services: ["Service 1", "Service 2"],
  yearsOfExperience: 10,
  languages: ["English"],
  availability: "Mon-Fri, 9 AM - 6 PM",
};
```

### Knowledge Base Entries
Add more entries to `knowledgeBase` array:

```typescript
{
  id: "unique-id",
  category: "expertise", // or "service", "case_study", "faq", "process"
  title: "Your Topic",
  content: "Detailed content...",
  keywords: ["keyword1", "keyword2"],
  relatedTopics: ["related-id"],
}
```

When users ask questions, the system searches these keywords and injects relevant knowledge into the AI's response.

---

## Troubleshooting

### "Failed to generate AI response" Error
**Cause:** Missing or invalid HuggingFace token

**Fix:**
1. Check `.env` file has `HF_TOKEN` set
2. Verify token is valid at https://huggingface.co/settings/tokens
3. Restart the dev server: `npm run dev`

### Mic button not working
**Cause:** Browser doesn't have permission or Web Speech API not available

**Fix:**
1. Allow microphone access when prompted
2. Use a modern browser (Chrome, Edge, Safari 14.1+)
3. Must be on HTTPS in production (localhost works without HTTPS)

### No voice response (text only)
**Cause:** Text-to-speech model temporarily unavailable on free tier

**Fix:**
- This is normal on Hugging Face free tier; responses appear as text
- Upgrade to Hugging Face Pro for reliable TTS, or
- Switch to a different TTS provider (ElevenLabs, Google Cloud TTS, etc.)

### Server won't start
**Cause:** Port 5174 already in use

**Fix:**
```bash
PORT=5175 npm run dev
```

---

## UI Overview

### Top Section
- **Logo**: "xelochat"
- **Theme Toggle**: Switch between dark/light mode

### Middle Section
- **Animated Avatar**: Shows listening/processing/speaking states
- **Chat Messages**: Your questions and AI responses displayed here

### Bottom Section
- **Microphone Button**: Large button to record your voice
  - Press to start recording
  - Release when done speaking
  - Button shows state (listening, processing, speaking)

---

## Next Steps

✅ Basic voice interaction is ready

**Optional Enhancements:**
- [ ] Add OpenAI API for better responses (replace HuggingFace)
- [ ] Add persistent conversation history to database
- [ ] Add user authentication
- [ ] Deploy to production (Vercel, Railway, etc.)
- [ ] Custom branding/styling
- [ ] Multiple consultant profiles
