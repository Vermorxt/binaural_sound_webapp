let audioContext;
let oscillatorLeft, oscillatorRight;
let gainLeft, gainRight;
let merger;
let isPlaying = false;

document.getElementById("playButton").addEventListener("click", () => {
  if (isPlaying) return;

  const leftFreq = parseFloat(document.getElementById("leftFreq").value);
  const rightFreq = parseFloat(document.getElementById("rightFreq").value);

  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Oszillatoren für linkes und rechtes Ohr
  oscillatorLeft = audioContext.createOscillator();
  oscillatorRight = audioContext.createOscillator();
  oscillatorLeft.type = "sine";
  oscillatorRight.type = "sine";
  oscillatorLeft.frequency.value = leftFreq;
  oscillatorRight.frequency.value = rightFreq;

  // Gain Nodes für Lautstärkekontrolle
  gainLeft = audioContext.createGain();
  gainRight = audioContext.createGain();
  gainLeft.gain.value = 0.5;
  gainRight.gain.value = 0.5;

  // Merger für Stereo-Ausgabe
  merger = audioContext.createChannelMerger(2);

  // Verbindung der Oszillatoren mit den Gain Nodes
  oscillatorLeft.connect(gainLeft);
  oscillatorRight.connect(gainRight);

  // Linken Kanal mit linkem Lautsprecher verbinden
  gainLeft.connect(merger, 0, 0);
  gainRight.connect(merger, 0, 1);

  // Verbinden mit Audio-Ausgabe
  merger.connect(audioContext.destination);

  // Starten der Oszillatoren
  oscillatorLeft.start();
  oscillatorRight.start();

  isPlaying = true;
  document.getElementById("playButton").classList.add("hidden");
  document.getElementById("stopButton").classList.remove("hidden");
});

document.getElementById("stopButton").addEventListener("click", () => {
  if (!isPlaying) return;

  oscillatorLeft.stop();
  oscillatorRight.stop();
  audioContext.close();

  isPlaying = false;
  document.getElementById("playButton").classList.remove("hidden");
  document.getElementById("stopButton").classList.add("hidden");
});
