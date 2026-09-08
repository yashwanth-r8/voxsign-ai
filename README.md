# VoxSign AI — Communication Copilot

A hackathon prototype for real-time two-way communication between sign language and speech using one smartphone.

## What this prototype does

- Camera-based hand tracking with MediaPipe HandLandmarker.
- User-trainable sign recognition using normalized hand landmark examples stored locally.
- Sign → text.
- Sign → speech with the browser SpeechSynthesis API.
- Speech → text with the browser SpeechRecognition API where supported.
- Two-way conversation history.
- Simple "Conversation → Action" productivity layer.
- PWA manifest and responsive mobile UI.

## Important limitation

Browser SpeechRecognition is not guaranteed to be on-device. Some browsers may send audio to a remote service. Do not claim fully offline speech recognition unless your team replaces this component with a genuinely on-device model.

## Run

Camera/microphone access requires a secure context. The easiest options are:

### Python
```bash
python3 -m http.server 8000
```
Open `http://localhost:8000`.

### GitHub Pages
Push the folder to a repository and enable GitHub Pages. The HTTPS URL can be opened on a phone.

## Demo flow

1. Open the app.
2. Start Camera.
3. Open Train a Sign.
4. Enter `HELP`.
5. Record the same sign 3–5 times.
6. Save each sample.
7. Show the sign again.
8. VoxSign recognizes it, displays it, and speaks it.
9. Start Listening and speak a response.
10. Use Create Action to turn the latest conversation message into a simple task/reminder.

## Hackathon honesty

This repository is a prototype/learning implementation. Follow your hackathon's rules regarding pre-existing code. Do not present pre-event code as if it was written during the event.
