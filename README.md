# Vento-TTS

Vento Text-to-Speech Backend API. This project provides a robust backend for generating text-to-speech audio, changing accents, and managing audio recordings.

## Features

- **Text-to-Speech (TTS) Generation**: Queue and store generated TTS audio. (Actual synthesis leverages frontend Web Speech API or external services).
- **Accent Conversion**: API to simulate converting audio from a source accent to a target accent.
- **Recording Management**: Full CRUD (Create, Read, Update, Delete) operations for your generated audio files.
- **Multi-Language Support**: Built-in support for numerous languages, voices, and accents.
- **File Uploads**: Handles temporary file uploads (e.g., .txt, .pdf, .wav) using Multer.

## Tech Stack

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Fast, unopinionated, minimalist web framework.
- **Multer**: Middleware for handling `multipart/form-data` (file uploads).
- **UUID**: Unique identifier generation for audio files.

## Project Structure

- `server.js`: The main Express server entry point.
- `start.bat`: Quick start script for Windows users.
- `public/`: Directory containing static frontend files served by the application.
- `recordings/`: Auto-generated directory where synthesized audio files and conversions are stored.
- `uploads/`: Auto-generated directory for handling temporary file uploads.
- `node_modules/`: Auto-generated directory containing all external packages.
- `myenv/`: Python virtual environment (for supplementary scripts, if any).

## Installation & Setup

1. **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) installed on your machine.
2. **Install Dependencies**:
   Open a terminal in the project directory and run:
   ```bash
   npm install
   ```
3. **Start the Server**:
   You can start the server in two ways:
   - Run the provided batch script (Windows only): Double-click `start.bat`
   - Or run via npm:
     ```bash
     npm start
     ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001` (or your configured `PORT`).

## API Endpoints

### Core Features
- `POST /api/tts/generate` - Generate new Text-to-Speech audio.
- `POST /api/accent/convert` - Convert audio from one accent to another.

### Recordings Management
- `GET /api/recordings` - Fetch all recordings (supports `search` and `filter` queries).
- `GET /api/recordings/:id` - Fetch a specific recording by ID.
- `PUT /api/recordings/:id` - Update a recording (e.g., change title).
- `DELETE /api/recordings/:id` - Delete a recording.
- `GET /api/recordings/:filename` - Stream the audio file.

### Metadata
- `GET /api/languages` - Get a list of supported languages.
- `GET /api/voices/:language` - Get available voices for a specific language.
- `GET /api/accents` - Get a list of available accents.

### System
- `GET /api/health` - Check API health status.

## License
MIT License