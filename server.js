const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const recordingsDir = path.join(__dirname, 'recordings');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(recordingsDir)) fs.mkdirSync(recordingsDir, { recursive: true });

// Serve static files
app.use('/uploads', express.static(uploadsDir));
app.use('/recordings', express.static(recordingsDir));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname))); // also serve from root

// In-memory storage (replace with database in production)
let recordings = [];

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.txt', '.wav', '.mp3', '.mp4'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

// ============================================
// TEXT TO SPEECH - Uses Web Speech API on frontend
// Backend stores the generated audio
// ============================================
app.post('/api/tts/generate', (req, res) => {
  const { text, language, voice, voiceName } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const id = uuidv4();
  const timestamp = new Date().toISOString();
  const duration = Math.max(1, Math.ceil(text.length / 20)); // Estimate ~20 chars/sec

  const recording = {
    id,
    title: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
    text,
    date: timestamp,
    feature: 'Text to Speech',
    language: language || 'en',
    voice: voiceName || 'Default',
    duration: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
    audioUrl: `/api/recordings/${id}.wav`,
    thumbnail: 'wave',
    createdAt: Date.now()
  };

  recordings.unshift(recording);

  res.json({
    success: true,
    recording,
    message: 'TTS generation queued. Use Web Speech API on frontend for actual synthesis.'
  });
});

// ============================================
// ACCENT CHANGER
// ============================================
app.post('/api/accent/convert', (req, res) => {
  const { text, sourceAccent, targetAccent, inputMode } = req.body;

  const id = uuidv4();
  const srcName = sourceAccent?.split('-')[0].toUpperCase() || 'Source';
  const tgtName = targetAccent?.split('-')[0].toUpperCase() || 'Target';

  const recording = {
    id,
    title: `${srcName} → ${tgtName}`,
    text: text || '',
    date: new Date().toISOString(),
    feature: 'Accent Changer',
    language: `${srcName} → ${tgtName}`,
    sourceAccent,
    targetAccent,
    duration: '0:12',
    audioUrl: `/api/recordings/${id}.wav`,
    thumbnail: 'circle',
    createdAt: Date.now()
  };

  recordings.unshift(recording);

  res.json({
    success: true,
    recording,
    originalAudioUrl: `/api/recordings/original-${id}.wav`,
    convertedAudioUrl: `/api/recordings/converted-${id}.wav`
  });
});



// ============================================
// RECORDINGS CRUD
// ============================================
app.get('/api/recordings', (req, res) => {
  const { search, filter } = req.query;
  let result = [...recordings];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(r => 
      r.title.toLowerCase().includes(q) || 
      r.language.toLowerCase().includes(q)
    );
  }

  if (filter && filter !== 'all') {
    result = result.filter(r => r.feature === filter);
  }

  res.json({ recordings: result, total: result.length });
});

app.get('/api/recordings/:id', (req, res) => {
  const recording = recordings.find(r => r.id === req.params.id);
  if (!recording) return res.status(404).json({ error: 'Recording not found' });
  res.json(recording);
});

app.put('/api/recordings/:id', (req, res) => {
  const { title } = req.body;
  const idx = recordings.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Recording not found' });

  recordings[idx] = { ...recordings[idx], title: title || recordings[idx].title };
  res.json({ success: true, recording: recordings[idx] });
});

app.delete('/api/recordings/:id', (req, res) => {
  const idx = recordings.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Recording not found' });

  recordings.splice(idx, 1);
  res.json({ success: true, message: 'Recording deleted' });
});

// ============================================
// AUDIO STREAMING (mock - returns placeholder)
// ============================================
app.get('/api/recordings/:filename', (req, res) => {
  // In production, serve actual generated files
  // For now, return a small placeholder audio
  const placeholder = Buffer.alloc(1024, 0);
  res.setHeader('Content-Type', 'audio/wav');
  res.send(placeholder);
});

// ============================================
// LANGUAGES & VOICES
// ============================================
app.get('/api/languages', (req, res) => {
  res.json({
    languages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
      { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
      { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
      { code: 'fr', name: 'French', flag: '🇫🇷' },
      { code: 'de', name: 'German', flag: '🇩🇪' },
      { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
      { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
      { code: 'ko', name: 'Korean', flag: '🇰🇷' },
      { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
      { code: 'ru', name: 'Russian', flag: '🇷🇺' },
      { code: 'it', name: 'Italian', flag: '🇮🇹' },
      { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    ]
  });
});

app.get('/api/voices/:language', (req, res) => {
  const voicesMap = {
    en: [{ id: 'en-m-1', name: 'James', gender: 'Male' }, { id: 'en-f-1', name: 'Sarah', gender: 'Female' }, { id: 'en-n-1', name: 'Alex', gender: 'Neutral' }],
    ur: [{ id: 'ur-m-1', name: 'Ahmed', gender: 'Male' }, { id: 'ur-f-1', name: 'Ayesha', gender: 'Female' }],
    ar: [{ id: 'ar-m-1', name: 'Omar', gender: 'Male' }, { id: 'ar-f-1', name: 'Layla', gender: 'Female' }],
    hi: [{ id: 'hi-m-1', name: 'Raj', gender: 'Male' }, { id: 'hi-f-1', name: 'Priya', gender: 'Female' }],
    es: [{ id: 'es-m-1', name: 'Carlos', gender: 'Male' }, { id: 'es-f-1', name: 'Maria', gender: 'Female' }],
    fr: [{ id: 'fr-m-1', name: 'Pierre', gender: 'Male' }, { id: 'fr-f-1', name: 'Sophie', gender: 'Female' }],
    de: [{ id: 'de-m-1', name: 'Hans', gender: 'Male' }, { id: 'de-f-1', name: 'Anna', gender: 'Female' }],
    zh: [{ id: 'zh-m-1', name: 'Li Wei', gender: 'Male' }, { id: 'zh-f-1', name: 'Mei', gender: 'Female' }],
    ja: [{ id: 'ja-m-1', name: 'Takeshi', gender: 'Male' }, { id: 'ja-f-1', name: 'Yuki', gender: 'Female' }],
    ko: [{ id: 'ko-m-1', name: 'Minho', gender: 'Male' }, { id: 'ko-f-1', name: 'Jiyeon', gender: 'Female' }],
    pt: [{ id: 'pt-m-1', name: 'João', gender: 'Male' }, { id: 'pt-f-1', name: 'Ana', gender: 'Female' }],
    ru: [{ id: 'ru-m-1', name: 'Dmitri', gender: 'Male' }, { id: 'ru-f-1', name: 'Natasha', gender: 'Female' }],
    it: [{ id: 'it-m-1', name: 'Marco', gender: 'Male' }, { id: 'it-f-1', name: 'Giulia', gender: 'Female' }],
    tr: [{ id: 'tr-m-1', name: 'Mehmet', gender: 'Male' }, { id: 'tr-f-1', name: 'Ayşe', gender: 'Female' }],
  };
  res.json({ voices: voicesMap[req.params.language] || [] });
});

app.get('/api/accents', (req, res) => {
  res.json({
    accents: [
      { code: 'en-us', name: 'English (US)', language: 'en' },
      { code: 'en-uk', name: 'English (UK)', language: 'en' },
      { code: 'en-au', name: 'English (Australian)', language: 'en' },
      { code: 'en-in', name: 'English (Indian)', language: 'en' },
      { code: 'ur-pk', name: 'Urdu (Pakistani)', language: 'ur' },
      { code: 'ur-in', name: 'Urdu (Indian)', language: 'ur' },
      { code: 'ar-sa', name: 'Arabic (Saudi)', language: 'ar' },
      { code: 'ar-ae', name: 'Arabic (UAE)', language: 'ar' },
      { code: 'ar-eg', name: 'Arabic (Egyptian)', language: 'ar' },
      { code: 'hi-in', name: 'Hindi (Indian)', language: 'hi' },
      { code: 'es-es', name: 'Spanish (Spain)', language: 'es' },
      { code: 'es-mx', name: 'Spanish (Mexico)', language: 'es' },
      { code: 'fr-fr', name: 'French (France)', language: 'fr' },
      { code: 'fr-ca', name: 'French (Canadian)', language: 'fr' },
      { code: 'de-de', name: 'German (Germany)', language: 'de' },
      { code: 'de-at', name: 'German (Austria)', language: 'de' },
      { code: 'zh-cn', name: 'Chinese (Mandarin)', language: 'zh' },
      { code: 'zh-tw', name: 'Chinese (Taiwan)', language: 'zh' },
      { code: 'ja-jp', name: 'Japanese', language: 'ja' },
      { code: 'ko-kr', name: 'Korean', language: 'ko' },
      { code: 'pt-br', name: 'Portuguese (Brazil)', language: 'pt' },
      { code: 'pt-pt', name: 'Portuguese (Portugal)', language: 'pt' },
      { code: 'ru-ru', name: 'Russian', language: 'ru' },
      { code: 'it-it', name: 'Italian', language: 'it' },
      { code: 'tr-tr', name: 'Turkish', language: 'tr' },
    ]
  });
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`Vento Backend running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  POST /api/tts/generate`);
  console.log(`  POST /api/accent/convert`);
  console.log(`  GET  /api/recordings`);
  console.log(`  GET  /api/languages`);
  console.log(`  GET  /api/health`);
});

module.exports = app;