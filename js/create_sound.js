const worker = new Worker("/js/wav-worker.js", { type: "module" });

const button = document.getElementById("generate");
const audioElement = document.getElementById("binauralAudio");
const leftFreqInput = document.getElementById("leftFreq");
const rightFreqInput = document.getElementById("rightFreq");
const balanceInput = document.getElementById("balance");

let audioContext = null;
let keepAliveSource = null; // 🔥 Unsichtbarer Audiostream
let isPlaying = false;

// ✅ **Web Audio API nur für Balance + Hintergrund-Trick**
function initializeAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  // 🔥 **Leeren Sound erzeugen, um iOS im Hintergrund aktiv zu halten**
  if (!keepAliveSource) {
    keepAliveSource = audioContext.createBufferSource();
    const buffer = audioContext.createBuffer(1, 1, 22050);
    keepAliveSource.buffer = buffer;
    keepAliveSource.loop = true;
    keepAliveSource.connect(audioContext.destination);
    keepAliveSource.start(0);
  }
}

// ✅ **Lock Screen Safe Audio**
function generateAudio() {
  const leftFreq = parseInt(leftFreqInput.value);
  const rightFreq = parseInt(rightFreqInput.value);

  button.innerHTML = "Generiert...";
  button.disabled = true;

  worker.postMessage({ leftFreq, rightFreq });

  worker.onmessage = (event) => {
    const { stereoArrayBuffer } = event.data;
    const stereoBlob = new Blob([stereoArrayBuffer], { type: "audio/wav" });

    if (!audioElement.src || audioElement.src.startsWith("blob:")) {
      audioElement.src = URL.createObjectURL(stereoBlob);
    }

    button.innerHTML = isPlaying ? "⏸ Pause" : "🎵 Play Sound";
    button.disabled = false;

    if (isPlaying) {
      audioElement.muted = false;
      audioElement.play();
      keepAudioAlive(); // 🔥 Hintergrund-Audio aktivieren
      setupMediaSession();
    }
  };
}

// ✅ **iOS Fix für Lock Screen: Regelmäßiges Play() erzwingen**
function keepAudioAlive() {
  setInterval(() => {
    if (isPlaying && document.visibilityState === "hidden") {
      audioElement.play();
    }
  }, 5000); // Alle 5 Sekunden sicherstellen, dass es weiterläuft
}

// ✅ **Media Session API für Lock Screen Steuerung**
function setupMediaSession() {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Binaurale Frequenzen",
      artist: "BrainSync",
      album: "Frequenz Generator",
      artwork: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
    });

    navigator.mediaSession.setActionHandler("play", () => {
      audioElement.play();
      isPlaying = true;
      button.innerHTML = "⏸ Pause";
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      audioElement.pause();
      isPlaying = false;
      button.innerHTML = "🎵 Play Sound";
    });
  }
}

// 🎵 **Button für Play/Pause**
button.addEventListener("click", () => {
  if (isPlaying) {
    audioElement.pause();
    button.innerHTML = "🎵 Play Sound";
  } else {
    initializeAudioContext();
    generateAudio();
    audioElement.muted = false;
    audioElement.play();
    keepAudioAlive(); // 🔥 iOS Fix aktivieren
    setupMediaSession();
  }
  isPlaying = !isPlaying;
});

// 🎵 **Frequenzänderung live übernehmen**
function handleFrequencyChange() {
  if (isPlaying) {
    generateAudio();
  }
}

leftFreqInput.addEventListener("input", handleFrequencyChange);
rightFreqInput.addEventListener("input", handleFrequencyChange);
