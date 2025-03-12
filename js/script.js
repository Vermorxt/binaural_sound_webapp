// Debug-Logging-System
const errorLog = document.getElementById("errorLog");
const deviceInfo = document.getElementById("deviceInfo");

// Geräteinformationen sammeln
function collectDeviceInfo() {
  try {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      audioSupport: !!(window.AudioContext || window.webkitAudioContext),
      touchSupport: "ontouchstart" in window,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    };

    deviceInfo.innerHTML = `
           <div>Browser: ${info.userAgent.substring(0, 100)}...</div>
           <div>Plattform: ${info.platform}</div>
           <div>Audio-API: ${
             info.audioSupport ? "Unterstützt" : "Nicht unterstützt"
           }</div>
           <div>Touch: ${
             info.touchSupport ? "Unterstützt" : "Nicht unterstützt"
           }</div>
           <div>Bildschirm: ${info.screenWidth}x${info.screenHeight}</div>
         `;

    logMessage("Device info collected", "info");
  } catch (e) {
    logMessage("Error collecting device info: " + e.message, "error");
  }
}

// Log löschen
document.getElementById("clearLog").addEventListener("click", function () {
  errorLog.innerHTML = "";
  logMessage("Log gelöscht", "info");
});

// Audio-Variablen
let audioContext = null;
let leftOsc = null,
  rightOsc = null,
  leftGain = null,
  rightGain = null,
  merger = null;
let isAudioRunning = false;
let audioContextInitialized = false;

// Audio-Test-Button
document.getElementById("testAudio").addEventListener("click", function () {
  testAudioSystem();
});

// Test des Audio-Systems
function testAudioSystem() {
  logMessage("Audio-System-Test gestartet", "info");

  try {
    // Test 1: AudioContext Erstellung
    logMessage("Test 1: AudioContext Erstellung", "info");
    const testContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    logMessage(
      `AudioContext erstellt, Status: ${testContext.state}`,
      "success"
    );

    // Test 2: Oszillator erstellen
    logMessage("Test 2: Oszillator erstellen", "info");
    const testOsc = testContext.createOscillator();
    testOsc.frequency.value = 440;
    logMessage("Oszillator erstellt", "success");

    // Test 3: GainNode erstellen
    logMessage("Test 3: GainNode erstellen", "info");
    const testGain = testContext.createGain();
    testGain.gain.value = 0.1;
    logMessage("GainNode erstellt", "success");

    // Test 4: Verbindung herstellen
    logMessage("Test 4: Audio-Verbindung herstellen", "info");
    testOsc.connect(testGain);
    testGain.connect(testContext.destination);
    logMessage("Verbindung hergestellt", "success");

    // Test 5: Kurzer Ton abspielen
    logMessage("Test 5: Kurzen Ton abspielen (0.2 Sekunden)", "info");
    testOsc.start();

    setTimeout(() => {
      try {
        testOsc.stop();
        testContext.close();
        logMessage("Ton erfolgreich abgespielt und gestoppt", "success");
        logMessage("Audio-System funktioniert korrekt", "success");
      } catch (e) {
        logMessage("Fehler beim Stoppen: " + e.message, "error");
      }
    }, 200);
  } catch (e) {
    logMessage("Audio-System-Test fehlgeschlagen: " + e.message, "error");
  }
}

// Audio-Kontext initialisieren mit zusätzlicher Fehlerbehandlung
function initAudioContext() {
  try {
    logMessage("Versuche AudioContext zu initialisieren", "info");

    if (!audioContextInitialized) {
      if (window.AudioContext) {
        logMessage("Verwende AudioContext", "info");
        audioContext = new window.AudioContext();
      } else if (window.webkitAudioContext) {
        logMessage("Verwende webkitAudioContext (ältere Browser)", "warning");
        audioContext = new window.webkitAudioContext();
      } else {
        throw new Error("Keine AudioContext-Unterstützung im Browser");
      }

      audioContextInitialized = true;
      logMessage(
        `AudioContext initialisiert, Status: ${audioContext.state}`,
        "success"
      );

      // Auf Android kann der Kontext "suspended" sein
      if (audioContext.state === "suspended") {
        logMessage(
          "AudioContext ist suspended, versuche zu starten",
          "warning"
        );

        try {
          audioContext
            .resume()
            .then(() => {
              logMessage("AudioContext erfolgreich gestartet", "success");
            })
            .catch((err) => {
              logMessage("Fehler beim Starten: " + err.message, "error");
            });
        } catch (e) {
          logMessage("Fehler beim resume()-Aufruf: " + e.message, "error");
        }
      }
    }
    return true;
  } catch (error) {
    logMessage("Kritischer Fehler bei AudioContext: " + error.message, "error");
    return false;
  }
}

function logMessage(message, type = "info") {
  const time = new Date().toLocaleTimeString();
  const item = document.createElement("div");
  item.className = "log-item";

  let color = "text-gray-300";
  if (type === "error") color = "text-red-400";
  if (type === "warning") color = "text-yellow-400";
  if (type === "success") color = "text-green-400";

  item.innerHTML = `<span class="text-gray-500">${time}</span> <span class="${color}">${message}</span>`;

  errorLog.appendChild(item);
  errorLog.scrollTop = errorLog.scrollHeight;

  while (errorLog.children.length > 30) {
    errorLog.removeChild(errorLog.firstChild);
  }
}

function startAudio() {
  logMessage("Play-Button gedrückt", "info");

  if (typeof window.unmuteIOSAudio === "function") {
    logMessage("Versuche iOS Audio zu aktivieren...");
    window.unmuteIOSAudio();
    logMessage("iOS Audio aktiviert!");

    if (!initAudioContext()) {
      logMessage("AudioContext-Initialisierung fehlgeschlagen", "error");
      return;
    }

    if (audioContext.state === "suspended") {
      logMessage("AudioContext ist suspended, versuche zu starten");
      audioContext
        .resume()
        .then(() => {
          logMessage("AudioContext gestartet, fahre fort");
        })
        .catch((err) => {
          logMessage("Fehler beim Starten des AudioContext:", "error");
        });
    }

    continueStartAudio();
  } else {
    console.error("Fehler: unmuteIOSAudio ist nicht verfügbar!");
  }
}

// Event-Listener für Play-Button
document.getElementById("play").addEventListener("click", startAudio);

// Event-Listener für Play-Button
document.getElementById("play").addEventListener("click", startAudio);

async function startAudio_old() {
  logMessage("Play-Button gedrückt", "info");

  // Lade das Skript und entmute iOS Audio
  // Dynamisches Importieren des Moduls
  import("https://cdn.jsdelivr.net/npm/unmute-ios-audio")
    .then((module) => {
      const unmuteIOSAudio = module.default || module; // Kompatibilität für verschiedene Exporte
      return unmuteIOSAudio();
    })
    .then(() => {
      logMessage("Versuche iOS Audio zu aktivieren", "info");
      unmuteIOSAudio()
        .then(() => {
          logMessage("iOS Audio aktiviert!", "success");

          if (!initAudioContext()) {
            logMessage(
              "Kann Audio nicht starten: AudioContext-Initialisierung fehlgeschlagen",
              "error"
            );
            initAudioContext();
          }

          if (audioContext.state === "suspended") {
            logMessage(
              "AudioContext ist suspended, versuche zu starten",
              "warning"
            );
            audioContext
              .resume()
              .then(() => {
                logMessage("AudioContext gestartet, fahre fort", "success");
                continueStartAudio();
              })
              .catch((err) => {
                logMessage(
                  "Fehler beim Starten des AudioContext: " + err.message,
                  "error"
                );
              });
          } else {
            continueStartAudio();
          }
        })
        .catch((err) => {
          logMessage(
            "Fehler beim Entmuten von iOS Audio: " + err.message,
            "error"
          );
        });
    });
}

function continueStartAudio() {
  try {
    logMessage("Starte Audio-Wiedergabe", "info");

    // Stoppe alte Oszillatoren, falls noch aktiv
    if (isAudioRunning) {
      logMessage("Stoppe vorhandene Oszillatoren", "info");
      try {
        leftOsc.stop();
        rightOsc.stop();
        logMessage("Oszillatoren gestoppt", "success");
      } catch (e) {
        logMessage(
          "Konnte alte Oszillatoren nicht stoppen: " + e.message,
          "warning"
        );
      }
    }

    // Erstelle neue Oszillatoren
    logMessage("Erstelle neue Oszillatoren", "info");
    createOscillators();
    isAudioRunning = true;

    // UI aktualisieren
    updateAudio();
    document.getElementById("play").classList.add("hidden");
    document.getElementById("pause").classList.remove("hidden");
    logMessage("Audio läuft jetzt", "success");
  } catch (error) {
    logMessage("Fehler beim Starten des Audios: " + error.message, "error");
  }
}

function stopAudio() {
  logMessage("Pause-Button gedrückt", "info");

  try {
    if (audioContext && isAudioRunning) {
      logMessage("Stoppe Oszillatoren", "info");

      try {
        leftOsc.stop();
        rightOsc.stop();
        logMessage("Oszillatoren gestoppt", "success");
      } catch (e) {
        logMessage(
          "Fehler beim Stoppen der Oszillatoren: " + e.message,
          "error"
        );
      }

      isAudioRunning = false;
      document.getElementById("play").classList.remove("hidden");
      document.getElementById("pause").classList.add("hidden");
      logMessage("Audio gestoppt", "success");
    } else {
      logMessage("Nichts zu stoppen: Audio läuft nicht", "warning");
    }
  } catch (error) {
    logMessage("Unerwarteter Fehler beim Stoppen: " + error.message, "error");
  }
}

function createOscillators() {
  try {
    logMessage("Erstelle Oszillatoren und Audio-Nodes", "info");

    // Erstelle Oszillatoren und Gain-Knoten
    leftOsc = audioContext.createOscillator();
    logMessage("Linker Oszillator erstellt", "info");

    rightOsc = audioContext.createOscillator();
    logMessage("Rechter Oszillator erstellt", "info");

    leftGain = audioContext.createGain();
    rightGain = audioContext.createGain();
    logMessage("Gain-Nodes erstellt", "info");

    merger = audioContext.createChannelMerger(2);
    logMessage("Channel-Merger erstellt", "info");

    // Konfiguriere Oszillatoren
    leftOsc.type = "sine";
    rightOsc.type = "sine";

    // Setze anfängliche Frequenzen
    const leftFreqValue = parseFloat(document.getElementById("leftFreq").value);
    const rightFreqValue = parseFloat(
      document.getElementById("rightFreq").value
    );

    logMessage(
      `Setze Frequenzen - Links: ${leftFreqValue}Hz, Rechts: ${rightFreqValue}Hz`,
      "info"
    );

    leftOsc.frequency.value = leftFreqValue;
    rightOsc.frequency.value = rightFreqValue;

    // Verbinde die Audio-Knoten
    logMessage("Verbinde Audio-Nodes", "info");

    leftOsc.connect(leftGain);
    rightOsc.connect(rightGain);
    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);
    merger.connect(audioContext.destination);

    logMessage("Audio-Verbindungen hergestellt", "success");

    // Setze initiale Lautstärke
    const volume = parseFloat(document.getElementById("volume").value);
    leftGain.gain.value = volume / 2;
    rightGain.gain.value = volume / 2;

    // Starte die Oszillatoren
    logMessage("Starte Oszillatoren", "info");
    leftOsc.start();
    rightOsc.start();
    logMessage("Oszillatoren gestartet", "success");

    // Aktualisiere die Anzeige
    updateAudio();
  } catch (error) {
    logMessage("Kritischer Fehler bei Oszillatoren: " + error.message, "error");
    throw error;
  }
}

function updateAudio() {
  if (!audioContext || !isAudioRunning) {
    logMessage(
      "updateAudio: Kein aktiver AudioContext oder Audio nicht aktiv",
      "warning"
    );
    return;
  }

  try {
    let leftFreq = parseFloat(document.getElementById("leftFreq").value);
    let rightFreq = parseFloat(document.getElementById("rightFreq").value);
    let volume = parseFloat(document.getElementById("volume").value);
    let balance = parseFloat(document.getElementById("balance").value);

    // Sicherstellen, dass gültige Zahlen verwendet werden
    leftFreq = isNaN(leftFreq) ? 250 : Math.max(20, Math.min(20000, leftFreq));
    rightFreq = isNaN(rightFreq)
      ? 260
      : Math.max(20, Math.min(20000, rightFreq));
    volume = isNaN(volume) ? 0.5 : Math.max(0, Math.min(1, volume));
    balance = isNaN(balance) ? 0 : Math.max(-1, Math.min(1, balance));

    // Setze Frequenzen - mehrere Methoden versuchen
    try {
      leftOsc.frequency.value = leftFreq;
      rightOsc.frequency.value = rightFreq;
    } catch (e) {
      logMessage("Fehler beim Setzen der Frequenz: " + e.message, "error");
    }

    // Setze Lautstärke und Balance
    let leftVol = volume * (balance <= 0 ? 1 : 1 - balance);
    let rightVol = volume * (balance >= 0 ? 1 : 1 + balance);

    try {
      leftGain.gain.value = leftVol / 2;
      rightGain.gain.value = rightVol / 2;
    } catch (e) {
      logMessage("Fehler beim Setzen der Lautstärke: " + e.message, "error");
    }

    // Aktualisiere Anzeige
    document.getElementById("displayLeft").innerText = Math.round(leftFreq);
    document.getElementById("displayRight").innerText = Math.round(rightFreq);
    document.getElementById("displayBalance").innerText = balance;
    document.getElementById("displayVolume").innerText = volume.toFixed(2);
  } catch (error) {
    logMessage(
      "Fehler beim Aktualisieren des Audios: " + error.message,
      "error"
    );
  }
}

// Event-Listener für Buttons
const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");

["click", "touchend"].forEach((eventType) => {
  playButton.addEventListener(eventType, function (e) {
    e.preventDefault();
    logMessage(`Play-Button-Event: ${eventType}`, "info");
    startAudio();
  });

  pauseButton.addEventListener(eventType, function (e) {
    e.preventDefault();
    logMessage(`Pause-Button-Event: ${eventType}`, "info");
    stopAudio();
  });
});

// Input-Listener
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", function () {
    logMessage(`Input geändert: ${input.id}`, "info");
    updateAudio();
  });
});

// Verbesserte Drag-Funktionalität
document.querySelectorAll(".drag-btn").forEach((button) => {
  const buttonId = button.id;
  logMessage(`Initialisiere Drag-Button: ${buttonId}`, "info");

  let isDragging = false;
  let startX;
  let freqInput;
  let initialFreq;

  // Touch-Start-Handler
  button.addEventListener(
    "touchstart",
    function (e) {
      logMessage(`TouchStart auf ${buttonId}`, "info");
      e.preventDefault();

      try {
        const touch = e.touches[0];
        startX = touch.clientX;

        freqInput = button.previousElementSibling;
        initialFreq = parseFloat(freqInput.value) || 250;

        isDragging = true;
        button.style.backgroundColor = "#ff5500";

        logMessage(
          `Drag gestartet: ${buttonId}, Startposition: ${startX}, Anfangsfrequenz: ${initialFreq}`,
          "info"
        );
      } catch (error) {
        logMessage(
          `Fehler bei touchstart für ${buttonId}: ${error.message}`,
          "error"
        );
      }
    },
    { passive: false }
  );

  // Touch-Move-Handler - auf dem DOCUMENT, nicht auf dem Button
  document.addEventListener(
    "touchmove",
    function (e) {
      if (!isDragging) return;

      try {
        e.preventDefault();

        const touch = e.touches[0];
        const currentX = touch.clientX;
        const deltaX = currentX - startX;

        logMessage(`TouchMove: Delta=${deltaX}px`, "info");

        // Änderung mit reduziertem Faktor für feinere Kontrolle
        let newFreq = initialFreq + deltaX * 0.5;
        newFreq = Math.max(20, Math.min(2000, newFreq));

        freqInput.value = Math.round(newFreq);
        button.style.transform = `translateX(${deltaX}px)`;

        updateAudio();
      } catch (error) {
        logMessage(`Fehler bei touchmove: ${error.message}`, "error");
      }
    },
    { passive: false }
  );

  // Touch-End-Handler
  document.addEventListener(
    "touchend",
    function (e) {
      if (!isDragging) return;

      try {
        logMessage(`TouchEnd für ${buttonId}`, "info");

        isDragging = false;
        button.style.backgroundColor = "#ff7700";
        button.style.transform = "translateX(0px)";
      } catch (error) {
        logMessage(`Fehler bei touchend: ${error.message}`, "error");
      }
    },
    { passive: false }
  );

  // Fallback für Maus-Events
  button.addEventListener("mousedown", function (e) {
    logMessage(`MouseDown auf ${buttonId}`, "info");
    e.preventDefault();

    try {
      startX = e.clientX;
      freqInput = button.previousElementSibling;
      initialFreq = parseFloat(freqInput.value) || 250;

      isDragging = true;
      button.style.backgroundColor = "#ff5500";
    } catch (error) {
      logMessage(`Fehler bei mousedown: ${error.message}`, "error");
    }
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;

    try {
      const deltaX = e.clientX - startX;

      let newFreq = initialFreq + deltaX;
      newFreq = Math.max(20, Math.min(2000, newFreq));

      freqInput.value = Math.round(newFreq);
      button.style.transform = `translateX(${deltaX}px)`;

      updateAudio();
    } catch (error) {
      logMessage(`Fehler bei mousemove: ${error.message}`, "error");
    }
  });

  document.addEventListener("mouseup", function () {
    if (!isDragging) return;

    try {
      logMessage(`MouseUp für ${buttonId}`, "info");

      isDragging = false;
      button.style.backgroundColor = "#ff7700";
      button.style.transform = "translateX(0px)";
    } catch (error) {
      logMessage(`Fehler bei mouseup: ${error.message}`, "error");
    }
  });
});

// Sammle Geräteinformationen beim Start
window.addEventListener("load", function () {
  logMessage("Seite geladen", "info");
  collectDeviceInfo();

  // Alternative Event-Listener für Audio-Aktivierung
  ["touchstart", "mousedown", "keydown"].forEach((event) => {
    document.addEventListener(
      event,
      function () {
        if (!audioContextInitialized) {
          logMessage(
            `Benutzerinteraktion erkannt (${event}), initialisiere AudioContext`,
            "info"
          );
          initAudioContext();
        }
      },
      { once: true }
    );
  });
});
