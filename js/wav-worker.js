import * as wavEncoder from "./wav-encoder.min.js";

self.onmessage = async (event) => {
  const { leftFreq, rightFreq } = event.data;
  const duration = 5;
  const totalDuration = 60 * 15;
  const sampleRate = 44100;

  const leftWav = await generateExtendedWav(
    leftFreq,
    duration,
    sampleRate,
    totalDuration
  );
  const rightWav = await generateExtendedWav(
    rightFreq,
    duration,
    sampleRate,
    totalDuration
  );

  // Konvertiere Blobs in ArrayBuffer, um sie an den Hauptthread zu senden
  const leftArrayBuffer = await leftWav.arrayBuffer();
  const rightArrayBuffer = await rightWav.arrayBuffer();

  self.postMessage({ leftArrayBuffer, rightArrayBuffer }, [
    leftArrayBuffer,
    rightArrayBuffer,
  ]);
};

async function generateExtendedWav(
  frequency,
  duration,
  sampleRate,
  totalDuration
) {
  const chunkDuration = duration;
  const lengthPerChunk = chunkDuration * sampleRate;
  const totalChunks = totalDuration / chunkDuration;
  const fullLength = totalChunks * lengthPerChunk;
  const channelData = new Float32Array(fullLength);

  for (let i = 0; i < lengthPerChunk; i++) {
    const t = i / sampleRate;
    channelData[i] = Math.sin(2 * Math.PI * frequency * t) * 0.5;
  }

  for (let i = 1; i < totalChunks; i++) {
    channelData.set(
      channelData.subarray(0, lengthPerChunk),
      i * lengthPerChunk
    );
  }

  const wavData = await wavEncoder.encode({
    sampleRate: sampleRate,
    channelData: [channelData],
  });

  return new Blob([wavData], { type: "audio/wav" });
}
