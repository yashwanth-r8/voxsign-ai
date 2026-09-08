import { HandLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/+esm";

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm";

const $ = id => document.getElementById(id);
const video = $("video"), canvas = $("landmarks"), ctx = canvas.getContext("2d");
const statusEl = $("modelStatus"), cameraStatus = $("cameraStatus"), overlay = $("cameraOverlay");
let handLandmarker, stream, rafId, lastVideoTime = -1, latestLandmarks = null;
let recording = false, recordingFrames = [], recordStarted = 0, pendingSample = null;
let lastRecognized = "", lastRecognizedAt = 0, recognitionStableCount = 0;
let samples = JSON.parse(localStorage.getItem("voxsign-samples") || "[]");
let conversation = JSON.parse(localStorage.getItem("voxsign-conversation") || "[]");
let tasks = JSON.parse(localStorage.getItem("voxsign-tasks") || "[]");
let recognition = null, listening = false;

function saveAll(){
  localStorage.setItem("voxsign-samples", JSON.stringify(samples));
  localStorage.setItem("voxsign-conversation", JSON.stringify(conversation));
  localStorage.setItem("voxsign-tasks", JSON.stringify(tasks));
}

function normalizeLandmarks(lm){
  if(!lm || lm.length < 21) return null;
  const wrist = lm[0];
  const pts = lm.map(p => ({x:p.x-wrist.x,y:p.y-wrist.y,z:p.z-wrist.z}));
  let scale = 0;
  for(const p of pts) scale = Math.max(scale, Math.hypot(p.x,p.y,p.z));
  scale = scale || 1;
  return pts.flatMap(p => [p.x/scale,p.y/scale,p.z/scale]);
}

function distance(a,b){
  if(!a || !b || a.length !== b.length) return Infinity;
  let s=0; for(let i=0;i<a.length;i++){const d=a[i]-b[i];s+=d*d}
  return Math.sqrt(s/a.length);
}

function clipDistance(a,b){
  if(!a?.length || !b?.length) return Infinity;
  const n=Math.min(a.length,b.length);
  let total=0;
  for(let i=0;i<n;i++) total += distance(a[i],b[i]);
  return total/n;
}

function classify(){
  if(!latestLandmarks || !samples.length) return null;
  const current = normalizeLandmarks(latestLandmarks);
  if(!current) return null;
  let best=null, bestD=Infinity;
  for(const s of samples){
    const d=clipDistance([current], s.frames.length ? s.frames : [s.vector]);
    if(d<bestD){bestD=d;best=s}
  }
  return best ? {name:best.name, distance:bestD} : null;
}

function addMessage(type,text){
  conversation.push({type,text,time:new Date().toISOString()});
  if(conversation.length>60) conversation=conversation.slice(-60);
  saveAll(); renderConversation();
}

function renderConversation(){
  const box=$("conversation");
  if(!conversation.length){box.innerHTML='<div class="empty-state">Your conversation will appear here.</div>';return}
  box.innerHTML=conversation.map(m=>`<div class="message ${m.type}"><small>${m.type==="sign"?"Sign":"Speech"}</small>${escapeHtml(m.text)}</div>`).join("");
  box.scrollTop=box.scrollHeight;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

function renderTasks(){
  const box=$("tasksList");
  if(!tasks.length){box.innerHTML='<div class="empty-state">No actions yet.</div>';return}
  box.innerHTML=tasks.slice().reverse().map((t,i)=>`<div class="task ${t.done?"done":""}">
    <div><strong>${escapeHtml(t.text)}</strong><small>${escapeHtml(t.when || "Created just now")}</small></div>
    <button class="ghost task-done" data-id="${t.id}">${t.done?"Undo":"Done"}</button>
  </div>`).join("");
  box.querySelectorAll(".task-done").forEach(b=>b.onclick=()=>{const t=tasks.find(x=>x.id===b.dataset.id);if(t){t.done=!t.done;saveAll();renderTasks()}});
}

function renderTrained(){
  $("trainedSigns").innerHTML = samples.length ? samples.reduce((acc,s)=>{
    if(!acc.some(x=>x===s.name)) acc.push(s.name); return acc;
  },[]).map(n=>`<span class="chip">${escapeHtml(n)}</span>`).join("") : '<span class="hint">No trained signs yet.</span>';
}

function speak(text){
  if(!text) return;
  if("speechSynthesis" in window){
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.rate=.95; u.pitch=1;
    speechSynthesis.speak(u);
  }
}

async function initModel(){
  try{
    statusEl.textContent="Loading AI…";
    const vision=await FilesetResolver.forVisionTasks(WASM_URL);
    handLandmarker=await HandLandmarker.createFromOptions(vision,{
      baseOptions:{modelAssetPath:MODEL_URL,delegate:"GPU"},
      runningMode:"VIDEO",numHands:1,minHandDetectionConfidence:.5,minHandPresenceConfidence:.5,minTrackingConfidence:.5
    });
    statusEl.textContent="AI ready";
    statusEl.style.color="#9ee7c3";
  }catch(e){
    console.error(e);
    statusEl.textContent="AI load failed";
    statusEl.style.color="#fca5a5";
    $("recognitionHint").textContent="Could not load the hand model. Check internet access and reload.";
  }
}

async function startCamera(){
  if(stream) return;
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1280},height:{ideal:720}},audio:false});
    video.srcObject=stream; await video.play();
    overlay.classList.add("hidden"); cameraStatus.textContent="Camera live";
    $("startCamera").textContent="Camera Running";
    predict();
  }catch(e){
    alert("Camera access failed. Use HTTPS or localhost and allow camera permission.");
    console.error(e);
  }
}

function predict(){
  if(!handLandmarker || video.readyState<2){rafId=requestAnimationFrame(predict);return}
  if(video.currentTime!==lastVideoTime){
    lastVideoTime=video.currentTime;
    const result=handLandmarker.detectForVideo(video,performance.now());
    ctx.clearRect(0,0,canvas.width,canvas.height);
    canvas.width=video.videoWidth||640; canvas.height=video.videoHeight||400;
    latestLandmarks=result.landmarks?.[0]||null;
    if(result.landmarks?.length){
      const drawing=new DrawingUtils(ctx);
      drawing.drawConnectors(result.landmarks[0],HandLandmarker.HAND_CONNECTIONS,{color:"#7dd3fc",lineWidth:3});
      drawing.drawLandmarks(result.landmarks[0],{color:"#ffffff",lineWidth:1,radius:3});
    }
    if(recording && latestLandmarks){
      recordingFrames.push(normalizeLandmarks(latestLandmarks));
      const elapsed=performance.now()-recordStarted;
      $("trainingProgress").style.width=Math.min(100,elapsed/1500*100)+"%";
      if(elapsed>=1500) finishRecording();
    }
    if(samples.length && latestLandmarks){
      const c=classify();
      if(c && c.distance<.17){
        if(c.name===lastRecognized) recognitionStableCount++;
        else {lastRecognized=c.name;recognitionStableCount=1}
        if(recognitionStableCount>=5 && performance.now()-lastRecognizedAt>2200){
          lastRecognizedAt=performance.now();
          $("recognizedText").textContent=c.name;
          $("recognitionHint").textContent="Recognized from your trained examples.";
          addMessage("sign",c.name);
          speak(c.name);
        }
      }
    }
  }
  rafId=requestAnimationFrame(predict);
}

function finishRecording(){
  recording=false;
  $("recordSign").disabled=false; $("recordSign").textContent="● Record Sign";
  $("trainingProgress").style.width="100%";
  if(recordingFrames.length<5){$("trainingStatus").textContent="Not enough frames. Try again.";return}
  pendingSample={name:$("signName").value.trim().toUpperCase(),frames:recordingFrames.filter(Boolean)};
  if(!pendingSample.name){$("trainingStatus").textContent="Enter a sign name before recording.";pendingSample=null;return}
  $("saveSign").disabled=false;
  $("trainingStatus").textContent=`Captured ${pendingSample.frames.length} frames for "${pendingSample.name}". Review and save.`;
}

function startRecording(){
  if(!stream){alert("Start the camera first.");return}
  const name=$("signName").value.trim();
  if(!name){alert("Enter a sign name first.");$("signName").focus();return}
  recording=true;recordingFrames=[];recordStarted=performance.now();
  $("recordSign").disabled=true;$("recordSign").textContent="Recording…";$("saveSign").disabled=true;
  $("trainingStatus").textContent="Hold the same sign and keep your hand in view.";
}

function saveSample(){
  if(!pendingSample)return;
  samples.push({id:crypto.randomUUID(),...pendingSample,created:new Date().toISOString()});
  saveAll(); renderTrained();
  $("saveSign").disabled=true; pendingSample=null; $("trainingStatus").textContent="Saved. Record 3–5 examples of the same sign for better matching.";
  $("signName").value="";
  $("trainingProgress").style.width="0%";
}

function setupSpeech(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){$("listenButton").disabled=true;$("speechStatus").textContent="Speech recognition is not supported in this browser. Try Chrome on Android/desktop.";return}
  recognition=new SR(); recognition.lang="en-US"; recognition.interimResults=true; recognition.continuous=false;
  recognition.onstart=()=>{listening=true;$("listenButton").textContent="⏹ Stop Listening";$("speechStatus").textContent="Listening…"};
  recognition.onresult=e=>{
    let finalText="";
    for(let i=e.resultIndex;i<e.results.length;i++) if(e.results[i].isFinal) finalText+=e.results[i][0].transcript;
    if(finalText.trim()){addMessage("speech",finalText.trim());}
  };
  recognition.onerror=e=>{$("speechStatus").textContent="Speech recognition error: "+e.error};
  recognition.onend=()=>{listening=false;$("listenButton").textContent="🎤 Start Listening";if($("speechStatus").textContent==="Listening…")$("speechStatus").textContent="Ready."};
}
function toggleListening(){
  if(!recognition)return;
  if(listening) recognition.stop(); else recognition.start();
}

function createAction(){
  const last=conversation.at(-1);
  if(!last){alert("Have a conversation first.");return}
  const text=last.text;
  const lower=text.toLowerCase();
  let when="No time extracted";
  const timeMatch=lower.match(/\b(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if(timeMatch) when=`Time detected: ${timeMatch[1]}${timeMatch[2]?":"+timeMatch[2]:""}${timeMatch[3]?" "+timeMatch[3].toUpperCase():""}`;
  tasks.push({id:crypto.randomUUID(),text:text.replace(/^(please\s+)?(remind me to|remember to|schedule)\s*/i,""),when,done:false});
  saveAll();renderTasks();alert("Action created from the latest message.");
}

$("startCamera").onclick=startCamera;
$("speakRecognized").onclick=()=>speak($("recognizedText").textContent==="—"?"":$("recognizedText").textContent);
$("listenButton").onclick=toggleListening;
$("clearConversation").onclick=()=>{conversation=[];saveAll();renderConversation()};
$("addTask").onclick=createAction;
$("openTraining").onclick=()=>{$("trainingPanel").classList.remove("hidden");renderTrained()};
$("closeTraining").onclick=()=>$("trainingPanel").classList.add("hidden");
$("recordSign").onclick=startRecording;
$("saveSign").onclick=saveSample;
window.addEventListener("resize",()=>{if(video.videoWidth){canvas.width=video.videoWidth;canvas.height=video.videoHeight}});
window.addEventListener("beforeunload",()=>{if(stream)stream.getTracks().forEach(t=>t.stop());if(rafId)cancelAnimationFrame(rafId)});

renderConversation();renderTasks();renderTrained();setupSpeech();initModel();
