# 🎙️ Vento — Voice Studio

**Vento** is a full-stack Text-to-Speech (TTS) web application. It lets you convert text into natural speech using the browser's Web Speech API, scan text from your camera using OCR, interact with a voice assistant, and manage all your generated recordings — all in a polished, modern UI.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔊 **Text to Speech** | Type or paste text, choose a language & voice, and generate speech instantly |
| 🎙️ **Voice Assistant** | Speak a question, get a spoken answer (Jarvis-style) |
| 📷 **Camera OCR** | Point your camera at any text and scan it directly into the TTS editor |
| 📁 **My Recordings** | Save, rename, play, download, and delete all generated audio |
| 🌍 **14 Languages** | English, Urdu, Arabic, Hindi, Spanish, French, German, Chinese, Japanese, Korean, Portuguese, Russian, Italian, Turkish |
| 🌙 **Dark Mode** | Toggle between Light and Dark themes |
| 📱 **Responsive Design** | Works on desktop and mobile |

---

## 🗂️ Project Structure

```
vento/
├── public/
│   └── index.html       # Single-page React app (CDN-based, no build step)
├── recordings/          # Auto-created: stores recording metadata
├── uploads/             # Auto-created: handles temp file uploads
├── server.js            # Express backend (REST API)
├── package.json         # Node.js dependencies
├── start.bat            # Windows one-click launcher
└── README.md
```

---

## ⚙️ Tech Stack

**Frontend**
- React 18 (via CDN, no build step required)
- Babel Standalone (JSX transpilation in browser)
- Tailwind CSS (via CDN)
- Web Speech API (TTS & Speech Recognition)
- Tesseract.js (Camera OCR)

**Backend**
- Node.js + Express.js
- Multer (file uploads)
- UUID (unique ID generation)

---

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server

**Option A — One click (Windows):**
Double-click `start.bat`

**Option B — npm:**
```bash
npm start
```

**Option C — Development mode (auto-reload):**
```bash
npm run dev
```

### 3. Open the app
Navigate to: **http://localhost:3001**

---

## 🌐 API Endpoints

### Text to Speech
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/tts/generate` | Queue a TTS generation and save to recordings |

**Request body:**
```json
{
  "text": "Hello world",
  "language": "en",
  "voice": "en-f-1",
  "voiceName": "Sarah"
}
```

### Recordings
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/recordings` | List all recordings (supports `?search=` and `?filter=`) |
| `GET` | `/api/recordings/:id` | Get a single recording |
| `PUT` | `/api/recordings/:id` | Rename a recording |
| `DELETE` | `/api/recordings/:id` | Delete a recording |

### Metadata
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/languages` | Get all supported languages |
| `GET` | `/api/voices/:language` | Get voices for a specific language |
| `GET` | `/api/health` | Health check |

---

## 🎤 How to Use

### Text to Speech
1. Open **Text to Speech** from the sidebar
2. Type or paste your text (up to 5,000 characters)
3. Select a **language** and **voice**
4. Click **Preview** to hear it immediately
5. Click **Generate & Save** to save it to My Recordings

### Camera OCR
1. Click **Scan Text** in the TTS editor
2. Allow camera access when prompted
3. Point the camera at printed or handwritten text
4. Click **Capture & Scan** — the detected text is added to your editor

### Voice Assistant
1. Open **Voice Assistant** from the sidebar
2. Click the microphone button and speak your question
3. Click **Get Answer** — the assistant speaks the response aloud
4. You can also type a question manually in the text area

### My Recordings
- **Play** any saved recording using the play button
- **Rename** a recording by clicking the pencil icon
- **Download** the text content
- **Copy** the text to clipboard via the share button
- **Delete** recordings you no longer need

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| White screen on load | Ensure `npm start` is running and visit `http://localhost:3001` |
| Camera not working for OCR | Allow camera permission in browser settings |
| No speech plays | Check that your browser supports Web Speech API (Chrome/Edge recommended) |
| Backend Offline badge shows | Server is not running — run `npm start` |
| Voice not matching language | Your OS may not have voices for that language installed |

---

## 📄 License

MIT License — free to use, modify, and distribute.
