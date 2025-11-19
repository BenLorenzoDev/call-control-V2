# Call-Control-V2 Development Session Notes

## Project Overview

**Call-Control-V2** is a real-time AI phone call monitoring and control system built for the #BuildWithVapi challenge.

- **Repository:** https://github.com/BenLorenzoDev/call-control-V2
- **Deployment:** Railway (auto-deploy enabled)
- **Status:** Production - Live and functional

### What This Application Does

- **Initiate outbound calls** using VAPI's AI telephony platform
- **Listen to live calls** in real-time via WebSocket audio streaming
- **Control active calls** dynamically (inject messages, mute/unmute, transfer calls, end calls)
- **Manage post-call dispositions** like professional call center software (12 disposition types)

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 4.21.2
- **HTTP Client:** Axios 1.7.9
- **CORS:** cors 2.8.5
- **Port:** 8080

### Frontend
- **Framework:** React 19.1.0
- **Routing:** react-router-dom 7.9.6
- **Animations:** framer-motion 12.15.0
- **Icons:** lucide-react 0.511.0
- **Audio:** Web Audio API with AudioWorklet
- **Design:** Glassmorphism dark theme

### Third-Party Services
- **VAPI.ai:** AI telephony platform
  - API Key: Configured in .env
  - Phone Number ID: 5f9b81d0-6c14-4cf6-8f3b-1ee3d6f6837e
  - Assistant ID: b364b66e-2034-4287-b472-0a064f27b013
  - WebSocket audio streaming for live call monitoring

---

## Project Structure

```
call-control-V2/
├── src/
│   ├── server.js              # Express backend with API routes
│   └── config.js              # Environment configuration
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CallForm.js           # Call initiation
│   │   │   ├── LiveListening.js      # WebSocket audio streaming
│   │   │   ├── CallControls.js       # Real-time call controls
│   │   │   ├── CallDisposition.js    # Post-call disposition form
│   │   │   ├── DispositionSuccess.js # Success feedback
│   │   │   ├── Header.js
│   │   │   └── Footer.js
│   │   ├── pages/
│   │   │   ├── MainPage.js           # Main call interface
│   │   │   └── DispositionPage.js    # Disposition workflow
│   │   └── App.js                    # Root component
│   └── public/
│       └── audioProcessor.js         # AudioWorklet processor
├── .env                              # Environment variables
├── package.json
└── SESSION_NOTES.md                  # This file
```

---

## API Endpoints

### Backend (Express)

1. **POST /initiate-call**
   - Starts a new outbound call via VAPI
   - Polls call status until answered (30 retries, 2s intervals)
   - Returns listenUrl for WebSocket audio streaming

2. **POST /control-call**
   - Sends real-time control commands to active calls
   - Types: say, add-message, control, transfer, end-call

3. **POST /submit-disposition**
   - Submits post-call disposition data
   - Optionally forwards to configured webhook

---

## Recent Development Sessions

### Session: 2025-11-19 - Bug Fix: Disposition Page Navigation

#### Issue Identified
When a user clicked "Stop Listening" during an ongoing call, the application incorrectly navigated to the disposition page, even though the call was still active. The disposition page should only appear when the call actually ends.

#### Root Cause
In `LiveListening.js`, the WebSocket `onclose` event handler couldn't distinguish between:
- User manually stopping audio playback (intentional disconnect)
- Call ending naturally (customer hung up or operator ended call)

The code was checking if `event.code !== 1000` and triggering disposition navigation for any non-normal close, including manual stops.

#### Solution Implemented
Added a `manualStopRef` flag to track user-initiated stops:

**Changes in `client/src/components/LiveListening.js`:**
1. Added `manualStopRef` useRef hook to track manual stops
2. Updated `stopAudio()` function to accept `isManual` parameter
3. Modified WebSocket `onclose` handler to check `!manualStopRef.current` before triggering disposition
4. Updated "Stop Listening" button to call `stopAudio(true)`

**Commit:** 265acae
**Status:** ✅ Deployed and tested on Railway - Working correctly

#### Test Results
- ✅ Manual stop listening: Stays on main page, call continues
- ✅ Natural call end: Navigates to disposition page as expected
- ✅ No regression in other features

---

## Key Features & Components

### 1. Call Initiation (CallForm.js)
- User inputs phone number and customer name
- Validates and initiates call via backend
- Disabled during active calls

### 2. Live Audio Streaming (LiveListening.js)
- WebSocket connection to VAPI listenUrl
- AudioWorklet for real-time audio playback (16kHz, Float32)
- Start/Stop listening controls
- Visual audio indicators
- **Recent Fix:** Properly handles manual stop vs. call end

### 3. Call Controls (CallControls.js)
- **Say Message:** Make AI assistant speak custom text
- **Add to Conversation:** Inject system/user/assistant messages
- **Mute/Unmute Assistant:** Control assistant audio
- **Say First Message:** Trigger assistant's first message
- **Transfer Call:** Forward calls to different numbers
- **End Call:** Terminate active calls

### 4. Disposition System (CallDisposition.js)
- 12 predefined disposition types:
  - SALE, CALLBACK, NO SALE, NOT INTERESTED, WRONG NUMBER
  - VOICEMAIL, BUSY, NO ANSWER, DNC, TRANSFER
  - FOLLOW UP, OTHER
- Required call notes field
- Optional webhook integration
- Session storage for data persistence between pages

### 5. Audio Processing (audioProcessor.js)
- Custom AudioWorkletProcessor
- Converts Int16 PCM to Float32 audio
- Stereo output to browser speakers
- Low-latency streaming

---

## Configuration

### Environment Variables (.env)
```
VAPI_API_KEY=9b3bf56b-0468-4e9f-ba4d-a714f00578cd
VAPI_PHONE_NUMBER_ID=5f9b81d0-6c14-4cf6-8f3b-1ee3d6f6837e
VAPI_ASSISTANT_ID=b364b66e-2034-4287-b472-0a064f27b013
VAPI_API_BASE_URL=https://api.vapi.ai
WEBHOOK_URL=(optional - for disposition data forwarding)
```

### Development Commands
```bash
npm run dev        # Concurrent backend + frontend development
npm run server     # Backend only (port 8080)
npm run client     # Frontend only (port 3000)
npm start          # Production mode
npm run build      # Build React production bundle
```

---

## Data Flow

```
User Input → CallForm → Backend → VAPI API
                           ↓
                    WebSocket URL returned
                           ↓
                    LiveListening connects
                           ↓
                    Audio streams to browser
                           ↓
User Controls → CallControls → Backend → VAPI Control API
                           ↓
                    Call Ends
                           ↓
            DispositionPage → Submit to Webhook
```

---

## Known Issues & Future Enhancements

### Current Status
- ✅ All core features functional
- ✅ Bug fix: Disposition navigation issue resolved
- ✅ Production deployment stable

### Potential Enhancements (Ideas for Future)
- [ ] Call history/log persistence (currently stateless)
- [ ] Database integration for disposition data
- [ ] Multi-agent support (handle multiple simultaneous calls)
- [ ] Real-time audio visualization improvements
- [ ] Call recording capability
- [ ] Analytics dashboard
- [ ] User authentication/authorization
- [ ] Team management features
- [ ] CRM integration

---

## Deployment Notes

### Railway Configuration
- **Auto-deploy:** Enabled (deploys on push to `main` branch)
- **Build Command:** `npm run build` (builds React client)
- **Start Command:** `npm start` (runs Express server)
- **Environment:** All .env variables configured in Railway dashboard

### Deployment Process
1. Make changes locally
2. Test locally with `npm run dev`
3. Commit changes: `git add . && git commit -m "message"`
4. Push to GitHub: `git push origin main`
5. Railway auto-detects push and deploys (~2-5 minutes)
6. Test on live deployment

---

## Quick Start for New Sessions

When starting a new development session:

1. **Review this file** to understand current state
2. **Check recent commits** on GitHub for latest changes
3. **Pull latest code:** `git pull origin main`
4. **Install dependencies:** `npm install` (if needed)
5. **Start development:** `npm run dev`
6. **Environment check:** Ensure .env file has all required keys

### Important Files to Check
- `client/src/components/LiveListening.js` - Audio streaming logic
- `client/src/components/CallControls.js` - Call control features
- `client/src/pages/MainPage.js` - Main interface coordination
- `src/server.js` - Backend API routes

---

## Session History

### 2025-11-19
- **Explored** entire codebase to understand architecture
- **Fixed** disposition page navigation bug in LiveListening component
- **Tested** fix on Railway production deployment
- **Created** this session notes file for future reference

---

## Notes for Claude in Future Sessions

### Project Context
This is **call-control-V2**, a VAPI-powered call center interface. It is NOT the EchoDialer project (which is in a separate directory and unrelated).

### Key Architecture Points
- React frontend proxies to Express backend in development (port 3000 → 8080)
- Production serves React build from Express
- WebSocket connections go directly to VAPI (not through our backend)
- No persistent database - uses sessionStorage for temporary data
- All call state managed by VAPI platform

### Testing Workflow
- Development testing: Local with `npm run dev`
- Production testing: Railway deployment (auto-deploys from GitHub)
- Must have valid VAPI credentials to test call functionality

---

**Last Updated:** 2025-11-19
**Project Status:** Production - Stable
**Next Session:** Reference this file for context and current state
