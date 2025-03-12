export function loadUnmuteScript(callback) {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/unmute-ios-audio";
  script.type = "module";
  script.onload = async () => {
    try {
      const { default: unmuteIOSAudio } = await import(
        "https://cdn.jsdelivr.net/npm/unmute-ios-audio"
      );
      callback(unmuteIOSAudio);
    } catch (error) {
      console.error("Fehler beim Laden von unmuteIOSAudio:", error);
    }
  };
  script.onerror = () =>
    console.error("Fehler: unmute-ios-audio konnte nicht geladen werden.");
  document.head.appendChild(script);
}
