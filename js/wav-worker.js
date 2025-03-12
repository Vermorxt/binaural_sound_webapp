import * as wavEncoder from "./wav-encoder.min.js";

self.onmessage = async (event) => {
  const { leftFreq, rightFreq } = event.data;
  const duration = 5;
  const totalDuration = 60 * 15;
  const sampleRate = 44100;

  const stereoWav = await generatePureStereoWav(
    leftFreq,
    rightFreq,
    duration,
    sampleRate,
    totalDuration
  );

  const stereoArrayBuffer = await stereoWav.arrayBuffer();
  self.postMessage({ stereoArrayBuffer }, [stereoArrayBuffer]);
};

async function generatePureStereoWav(
  leftFreq,
  rightFreq,
  duration,
  sampleRate,
  totalDuration
) {
  const chunkDuration = duration;
  const lengthPerChunk = chunkDuration * sampleRate;
  const totalChunks = totalDuration / chunkDuration;
  const fullLength = totalChunks * lengthPerChunk;

  const leftChannel = new Float32Array(fullLength);
  const rightChannel = new Float32Array(fullLength);

  for (let i = 0; i < fullLength; i++) {
    const t = i / sampleRate;
    leftChannel[i] = Math.sin(2 * Math.PI * leftFreq * t); // 100% linker Kanal
    rightChannel[i] = Math.sin(2 * Math.PI * rightFreq * t); // 100% rechter Kanal
  }

  const wavData = await wavEncoder.encode({
    sampleRate: sampleRate,
    channelData: [leftChannel, rightChannel], // Klares Stereo
  });

  return new Blob([wavData], { type: "audio/wav" });
}
