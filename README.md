# VoxSign AI — v13.1

**VoxSign AI** is a phone-first communication assistant designed to help bridge communication between sign-language users and speaking users through sign detection, speech, translation, Morse code, and real-time communication features.

## 🔗 Links

- **GitHub Repository:** https://github.com/yashwanth-r8/voxsign-ai
- **Live Prototype:** https://yashwanth-r8.github.io/voxsign-ai/

---

## 🚀 Features

### 📷 Sign Detector

- Real-time camera-based hand detection.
- Displays hand landmarks over the camera feed.
- Uses trained sign samples for prototype recognition.
- Camera starts only when the user explicitly starts it.
- Detection results can be sent directly to the conversation.

### 🧠 Train a Sign

Users can create their own sign vocabulary.

- Enter a sign name.
- Start the training camera.
- Record hand-sign samples.
- Capture multiple samples for better matching.
- Save the trained sign.
- Trained signs can be used by the Sign Detector.
- No image upload is required.

> The training system is a prototype landmark-based recognizer and should not be presented as a complete or clinically validated sign-language recognition system.

### 💬 Live Conversation

The conversation panel supports:

- Sign → Message
- Speech → Text
- Text → Speech
- Conversation history
- Clear conversation
- Translate individual messages
- Translate the latest message
- Conversation Message → Morse Code

### 🌐 Multilingual Translation

VoxSign AI supports translation between multiple languages, including:

- English
- Tamil
- Hindi
- Telugu
- Malayalam
- Kannada
- Bengali
- Marathi
- Urdu
- Arabic
- Spanish
- French
- German
- Chinese
- Japanese
- Korean
- Russian
- Portuguese
- And more

The preferred language can also be selected from **Settings**.

### 📡 Audio & Video Calls

The prototype includes browser-based communication features:

- Audio Call
- Video Call
- Shareable Call ID
- Browser-to-browser communication using WebRTC

### 👤 Profile

Users can manage their profile information:

- Name
- Gmail address
- Profile information

### ⚙️ Settings

The Settings page provides:

- 🎨 Theme selection
- 🌐 Preferred language
- Saved user preferences

### 🎨 Five Themes

Choose from five interface themes:

1. Indigo
2. Ocean
3. Emerald
4. Sunset
5. Midnight

The selected theme is saved locally.

---

## 🏗️ Technology

VoxSign AI is built using:

- HTML5
- CSS3
- JavaScript
- MediaPipe Hand Landmarker
- WebRTC
- Web Speech API
- Browser LocalStorage
- GitHub Pages

---

## 🔐 Login

The prototype provides a Gmail/Google-style login interface.

For a production deployment, real Google authentication requires OAuth configuration with an authorized Google Cloud project and domain.

---

## ⚠️ Sign-Language Accuracy

VoxSign AI is currently a **prototype**.

The sign recognition system should not be presented as a verified ISL/ASL dictionary or as a complete sign-language translator.

Sign-language gestures vary by language, region, community, and context. Before real-world deployment, gesture mappings should be validated with qualified/native sign-language users.

---

## 🌍 Browser Requirements

For camera, microphone, speech recognition, and calling:

- Use HTTPS or `localhost`.
- Allow browser camera permission.
- Allow microphone permission when required.
- Use a modern browser such as Chrome or Edge.

Browser SpeechRecognition support and processing behavior can vary between browsers.

---

## 📱 Phone-First Design

VoxSign AI is designed with a mobile-first approach so that the core communication experience can be demonstrated directly on a smartphone.

The interface focuses on:

**Camera + Conversation + Translation + Communication**

---

## 📂 Project Structure

```text
voxsign-ai/
│
├── index.html
├── app.js
├── styles.css
├── manifest.json
└── README.md
