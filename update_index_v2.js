const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf-8');

// 1. Add Tesseract
html = html.replace('<script src="https://cdn.tailwindcss.com"></script>', '<script src="https://cdn.tailwindcss.com"></script>\n<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>');

// 2. Replace Accent Changer with Camera OCR
const accentStartStr = '// ============================================\n// ACCENT CHANGER (FIXED - shows live text + accent info)\n// ============================================';
const voiceAssistStr = '// ============================================\n// VOICE ASSISTANT';

if (html.includes(accentStartStr) && html.includes(voiceAssistStr)) {
  const parts1 = html.split(accentStartStr);
  const parts2 = parts1[1].split(voiceAssistStr);
  
  const cameraOCR = `// ============================================
// CAMERA OCR
// ============================================
const CameraOCR = ({ onScan, onClose, onToast }) => {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [stream, setStream] = React.useState(null);

  React.useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(err => {
        onToast('Camera access denied or unavailable', 'error');
        onClose();
      });
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      const result = await window.Tesseract.recognize(canvas.toDataURL('image/png'), 'eng');
      if (result.data.text.trim()) {
        onScan(result.data.text);
        onClose();
      } else {
        onToast('No text found. Try again.', 'warning');
      }
    } catch (err) {
      onToast('Error scanning text', 'error');
    }
    setIsScanning(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-warmWhite rounded-2xl p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-display font-bold text-charcoal">Scan Text</h3>
          <button onClick={onClose} className="p-2 hover:bg-sand rounded-lg"><Icons.X s={20} /></button>
        </div>
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-4">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          {isScanning && (
            <div className="absolute inset-0 bg-teal/20 flex flex-col items-center justify-center">
              <Icons.Loader s={32} c="text-white animate-spin mb-2" />
              <p className="text-white font-medium">Scanning...</p>
            </div>
          )}
        </div>
        <button onClick={handleScan} disabled={isScanning} className="w-full py-3 bg-teal hover:bg-tealDark text-white rounded-xl font-medium transition-colors">
          Capture & Scan
        </button>
      </div>
    </div>
  );
};

`;
  html = parts1[0] + cameraOCR + voiceAssistStr + parts2[1];
} else {
  console.log("Could not find Accent changer bounds!");
}

// 3. Add OCR to TextToSpeech
const ttsButtonArea = '<button onClick={isSpeaking ? stopSpeech : speakText} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors ${isSpeaking ? \'bg-red-500 hover:bg-red-600 text-white\' : \'bg-accent hover:bg-accent/90 text-white\'}`}>';
const ocrState = `const [showOCR, setShowOCR] = useState(false);\n\n  const handleOCRScan = (scannedText) => {\n    setText(prev => prev ? prev + ' ' + scannedText : scannedText);\n  };\n\n  return (\n    <div className="animate-fadeIn max-w-3xl mx-auto">`;

html = html.replace('return (\n    <div className="animate-fadeIn max-w-3xl mx-auto">', ocrState);
html = html.replace(ttsButtonArea, '<button onClick={() => setShowOCR(true)} className="flex items-center gap-2 px-6 py-3 bg-lavender hover:bg-lavenderLight text-charcoal rounded-xl font-medium text-sm transition-colors"><Icons.Camera s={18} /> Scan Text</button>\n          ' + ttsButtonArea);
html = html.replace('</TextToSpeech>', '{showOCR && <CameraOCR onScan={handleOCRScan} onClose={() => setShowOCR(false)} onToast={onToast} />}\n    </div>\n  );\n};\n');
html = html.replace('</div>\n  );\n};\n\n// ============================================\n// VOICE ASSISTANT', '  {showOCR && <CameraOCR onScan={handleOCRScan} onClose={() => setShowOCR(false)} onToast={onToast} />}\n    </div>\n  );\n};\n\n// ============================================\n// VOICE ASSISTANT');

// 4. Update Nav
html = html.replace("{ id: 'accent', label: 'Accent Changer', icon: Icons.ArrowRightLeft },", "");
html = html.replace("case 'accent': return <AccentChanger onSave={addRecording} onToast={showToast} />;", "");

// 5. Update MyRecordings filter
html = html.replace('<option value="Accent Changer">Accent Changer</option>', "");

// 6. Fix Voice Assistant text
html = html.replace("accent changing,", "scanning text,");

fs.writeFileSync('public/index.html', html);
console.log("index.html updated successfully!");
