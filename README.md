# VoxSign AI — v6

A phone-first communication prototype for sign, speech, Morse, actions, and browser-to-browser calls.

## v6 upgrades
- Photo-first Manual Sign Pad: tap a sign photo and send its assigned message immediately.
- Custom hand-sign photos can be uploaded and linked to any custom message.
- Five switchable themes: Indigo, Ocean, Emerald, Sunset, Midnight.
- Morse Code text ↔ Morse inside Live Conversation.
- WebRTC audio/video calling with a shareable Call ID.
- Faster camera loop and shorter duplicate-gesture cooldown for more responsive demo recognition.
- Help Desk and Profile remain available.

## Sign-language accuracy note
The app must not be presented as a verified ISL/ASL dictionary. The included photo references are illustrative/reference material and should be validated with qualified sign-language users before real-world use. Custom photos are the recommended path for the hackathon demo.

## Browser notes
Camera and calling require HTTPS or localhost and browser permissions. Browser SpeechRecognition support varies and may use a remote service.

## Attribution
Some default reference photos are linked from Wikimedia Commons. See the individual file pages for their Creative Commons licensing and attribution requirements.


### v7 changes
- Auto Hand Sign is OFF by default and camera access starts only after explicit confirmation.
- Camera and Live Conversation remain side-by-side on the Home dashboard.
- Manual Sign Pad gives instant responses without the camera.
- Built-in sign cards use photo references where verified reference media was found; remaining cards are clearly treated as demo references.
- Morse Code is one-way for this prototype: conversation message/text → Morse. There is no Morse → text conversion.
- Each conversation message can be converted to Morse directly.
- Auto recognition uses MediaPipe hand landmarks in the browser; the demo classifier is intentionally small and should not be presented as a complete ISL recognizer.

Photo references used in the prototype include Wikimedia Commons ASL materials. These are ASL references, not ISL instruction; verify gestures with qualified/native sign-language users before real-world use.
