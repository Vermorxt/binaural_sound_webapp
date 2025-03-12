const worker = new Worker("/js/wav-worker.js", { type: "module" });

const button = document.getElementById("generate");
const leftAudio = document.getElementById("leftAudio");
const rightAudio = document.getElementById("rightAudio");
const leftFreqInput = document.getElementById("leftFreq");
const rightFreqInput = document.getElementById("rightFreq");
// const volumeInput = document.getElementById("volume");
// const balanceInput = document.getElementById("balance");

let currentLeftFreq = parseInt(leftFreqInput.value);
let currentRightFreq = parseInt(rightFreqInput.value);
let isPlaying = false;

function generateAudio() {
  const leftFreq = parseInt(leftFreqInput.value);
  const rightFreq = parseInt(rightFreqInput.value);
  // const volume = parseFloat(volumeInput.value);
  // const balance = parseFloat(balanceInput.value);

  button.innerHTML = `<div class='flex items-center justify-center'>
    <svg class='animate-spin h-5 w-5 mr-2 text-white' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
      <circle cx='12' cy='12' r='10' stroke-opacity='0.25'></circle>
      <path d='M12 6v6l4 2' stroke-opacity='0.75'></path>
    </svg> Generiert...
  </div>`;
  button.disabled = true;
  button.classList.add("bg-gray-600", "cursor-not-allowed");

  worker.postMessage({ leftFreq, rightFreq });

  worker.onmessage = (event) => {
    const { leftArrayBuffer, rightArrayBuffer } = event.data;

    const leftBlob = new Blob([leftArrayBuffer], { type: "audio/wav" });
    const rightBlob = new Blob([rightArrayBuffer], { type: "audio/wav" });

    leftAudio.src = URL.createObjectURL(leftBlob);
    rightAudio.src = URL.createObjectURL(rightBlob);

    // leftAudio.volume = volume;
    // rightAudio.volume = volume;

    // Media Session API entfernen (verhindert Anzeige auf Sperrbildschirm)
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = null;
    }

    button.innerHTML = isPlaying ? "⏸ Pause" : "🎵 Play Sound";
    button.disabled = false;
    button.classList.remove("bg-gray-600", "cursor-not-allowed");

    if (isPlaying) {
      leftAudio.play();
      rightAudio.play();
    }
  };
}

button.addEventListener("click", () => {
  if (isPlaying) {
    leftAudio.pause();
    rightAudio.pause();
    button.innerHTML = "🎵 Play Sound";
  } else {
    leftAudio.muted = false; // Stummschaltung entfernen
    rightAudio.muted = false;
    generateAudio();
  }
  isPlaying = !isPlaying;
});

// Überwachung von Frequenzänderungen
function handleFrequencyChange() {
  const newLeftFreq = parseInt(leftFreqInput.value);
  const newRightFreq = parseInt(rightFreqInput.value);

  if (
    (newLeftFreq !== currentLeftFreq || newRightFreq !== currentRightFreq) &&
    isPlaying
  ) {
    currentLeftFreq = newLeftFreq;
    currentRightFreq = newRightFreq;
    generateAudio();
  }
}

leftFreqInput.addEventListener("input", handleFrequencyChange);
rightFreqInput.addEventListener("input", handleFrequencyChange);
