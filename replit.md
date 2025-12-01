# xelochat - AI Voice Conversation Application

## Overview
xelochat is a conversational AI web application that enables natural voice interactions with an AI assistant. The app features an animated dotted human avatar that lip-syncs to AI responses, creating an engaging visual experience.

## Current State
**Status**: Production Ready - Using Free Hugging Face Models

The application is built with a modern tech stack:
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Hugging Face Inference API (free, open-source models)
- **Chat Model**: meta-llama/Llama-3.1-8B-Instruct
- **TTS**: facebook/mms-tts-eng (graceful fallback to text-only if unavailable)
- **Speech Recognition**: Web Speech API + openai/whisper-large-v3 fallback
- **State Management**: TanStack Query

## Recent Changes
**October 16, 2025**
- Renamed application from NewChat to xelochat
- Migrating from OpenAI to Hugging Face Inference API (free, open-source models)
- Switching to Llama-3.1-8B-Instruct for conversational AI
- Implementing Hugging Face TTS for voice synthesis

**October 13, 2025**
- Initial project setup completed
- Implemented complete frontend UI with all components
- Created animated dotted avatar with state-based animations (idle, listening, processing, speaking)
- Built voice input system using Web Speech API
- Implemented audio playback with amplitude analysis for lip-sync
- Designed conversation interface with beautiful message bubbles
- Added theme toggle (dark/light mode) with smooth transitions
- Configured design system with custom color tokens

## Features Implemented
### ✅ Frontend (Complete)
- **Animated Avatar**: Dotted human figure with breathing animation, state-based glows, and lip-sync
- **Voice Controls**: Large microphone button with visual state feedback
- **Conversation Display**: Clean chat interface with user/AI message distinction
- **Theme Support**: Dark/light mode with persistent preference
- **Responsive Design**: Mobile-first approach with breakpoint optimizations
- **Loading States**: Smooth transitions between idle, listening, processing, and speaking states

### ✅ Backend (Complete)
- Hugging Face Llama-3.1-8B for intelligent conversational responses
- Hugging Face Whisper for speech-to-text transcription (fallback)
- Graceful TTS fallback (text-only mode when audio unavailable)
- Audio file handling and streaming
- Conversation history context (last 4 messages)

## Project Architecture

### Data Model (`shared/schema.ts`)
- **Message**: Conversation messages with role, content, and timestamp
- **ConversationState**: Enum for tracking app state (idle, listening, processing, speaking)
- **API Schemas**: Request/response types for chat and transcription

### Frontend Components
- `DottedAvatar`: Canvas-based animated avatar with lip-sync capability
- `VoiceButton`: Microphone control with state-based styling
- `ChatMessage`: Individual message bubbles with user/AI distinction
- `ConversationArea`: Scrollable message container with empty state
- `ThemeToggle`: Dark/light mode switcher
- `ThemeProvider`: Theme state management with localStorage persistence

### Custom Hooks
- `useVoiceInput`: Web Speech API integration for voice recognition
- `useAudioPlayback`: Audio playback with amplitude analysis for avatar animation

### API Routes (Planned)
- `POST /api/chat`: Send message, get AI response with audio URL
- `POST /api/transcribe`: Convert audio to text (fallback for browsers without Web Speech API)

## User Preferences
- **Design Style**: Modern, clean interface with animated avatar as focal point
- **Color Scheme**: Dark mode primary (deep charcoal background, vibrant blue accents)
- **Interaction Pattern**: Voice-first conversation with visual feedback
- **Animation**: Smooth state transitions, breathing effects, lip-sync to speech

## Completed Implementation
1. ✅ Complete frontend UI with animated dotted avatar
2. ✅ Hugging Face backend integration (free models)
3. ✅ Frontend-backend API connection
4. ✅ End-to-end voice conversation flow (tested)
5. ✅ Comprehensive error handling with graceful degradation
6. ✅ Production-ready with type safety

## Notes
- **TTS Limitation**: Free Hugging Face tier has limited TTS provider availability. App gracefully falls back to text-only responses when TTS is unavailable.
- **Voice Input**: Uses browser's Web Speech API when available, with server-side Whisper fallback for unsupported browsers.
- **Chat Model**: Llama-3.1-8B-Instruct provides quality conversational responses completely free.

## Environment Variables
- `HF_TOKEN`: Hugging Face API token for Inference API (get from https://huggingface.co/settings/tokens)
- `SESSION_SECRET`: Session management secret

## Development Notes
- The dotted avatar is rendered on HTML Canvas for performance
- Lip-sync animation responds to real-time audio amplitude
- Web Speech API is used for voice input (browser-native, no server needed)
- Hugging Face TTS provides voice responses when available (free tier has limitations)
- Dark mode is the default theme per design guidelines
