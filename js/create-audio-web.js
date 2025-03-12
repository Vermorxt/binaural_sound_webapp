let audioContext, leftOsc, rightOsc, leftGain, rightGain, merger;
let isPlaying = false;

const button = document.getElementById("generate");
const leftFreqInput = document.getElementById("leftFreq");
const rightFreqInput = document.getElementById("rightFreq");
const balanceInput = document.getElementById("balance");
const balanceValueDisplay = document.getElementById("balance-value");

function startAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    createOscillators();
  }
  updateAudio();
  isPlaying = true;
  button.innerHTML = "⏸ Pause";
}

function stopAudio() {
  if (audioContext) {
    leftOsc.stop();
    rightOsc.stop();
    audioContext.close();
    audioContext = null;
  }
  isPlaying = false;
  button.innerHTML = "🎵 Play Sound";
}

function updateBalanceDisplay() {
  balanceValueDisplay.textContent = balanceInput.value;
}

function createOscillators() {
  leftOsc = audioContext.createOscillator();
  rightOsc = audioContext.createOscillator();
  leftGain = audioContext.createGain();
  rightGain = audioContext.createGain();
  merger = audioContext.createChannelMerger(2);

  leftOsc.type = "sine";
  rightOsc.type = "sine";

  // ✅ Frequenz direkt setzen, bevor der Ton startet
  leftOsc.frequency.value = parseFloat(leftFreqInput.value);
  rightOsc.frequency.value = parseFloat(rightFreqInput.value);

  leftOsc.connect(leftGain);
  rightOsc.connect(rightGain);
  leftGain.connect(merger, 0, 0);
  rightGain.connect(merger, 0, 1);
  merger.connect(audioContext.destination);

  let now = audioContext.currentTime;
  leftOsc.start(now);
  rightOsc.start(now);
}

function updateAudio() {
  if (!audioContext) return;

  let leftFreq = parseFloat(leftFreqInput.value);
  let rightFreq = parseFloat(rightFreqInput.value);
  let balance = parseFloat(balanceInput.value);
  let now = audioContext.currentTime;

  // Sanfte Frequenzänderung ohne Knackser
  leftOsc.frequency.setTargetAtTime(leftFreq, now, 0.05);
  rightOsc.frequency.setTargetAtTime(rightFreq, now, 0.05);

  // Balance steuern
  let leftVol = balance <= 0 ? 1 : 1 - balance;
  let rightVol = balance >= 0 ? 1 : 1 + balance;
  leftGain.gain.linearRampToValueAtTime(leftVol / 2, now + 0.05);
  rightGain.gain.linearRampToValueAtTime(rightVol / 2, now + 0.05);
}

// 🎵 **Button-Logik für Play/Pause**
button.addEventListener("click", () => {
  if (isPlaying) {
    stopAudio();
  } else {
    startAudio();
  }
});

// 🎵 **Frequenz- und Balance-Änderungen live übernehmen**
function handleFrequencyChange() {
  if (isPlaying) {
    updateAudio();
  }

  updateBalanceDisplay();
}

updateBalanceDisplay();

leftFreqInput.addEventListener("input", handleFrequencyChange);
rightFreqInput.addEventListener("input", handleFrequencyChange);
balanceInput.addEventListener("input", handleFrequencyChange);
