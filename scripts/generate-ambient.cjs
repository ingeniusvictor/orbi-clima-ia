const fs = require('fs');
const path = require('path');

function generateAmbientAudio() {
  const dirPath = path.join(__dirname, '..', 'public', 'audio');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const sampleRate = 11025; // Compact sample rate for tiny size
  const duration = 30; // 30 seconds
  const numSamples = sampleRate * duration;
  const numChannels = 1;
  const bitsPerSample = 8; // 8-bit mono is tiny (~330 KB)
  
  const header = Buffer.alloc(44);
  const fileLength = 36 + numSamples;
  
  header.write('RIFF', 0);
  header.writeUInt32LE(fileLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20); // AudioFormat: 1 = PCM
  header.writeUInt16LE(numChannels, 22); // NumChannels
  header.writeUInt32LE(sampleRate, 24); // SampleRate
  header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // ByteRate
  header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // BlockAlign
  header.writeUInt16LE(bitsPerSample, 34); // BitsPerSample
  header.write('data', 36);
  header.writeUInt32LE(numSamples, 40);

  const audioBuffer = Buffer.alloc(numSamples);
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    
    // Solfeggio / meditative frequencies:
    // f1 = 132 Hz (C2 - harmonic foundation)
    // f2 = 198 Hz (G2 - perfect fifth)
    // f3 = 264 Hz (C3 - perfect octave)
    // f4 = 396 Hz (G3 - meditative solfeggio, root chord)
    
    // Slow breathing modulation (24-second cycle)
    const breathLfo = 0.5 + 0.45 * Math.cos((2 * Math.PI * t) / 24);
    
    // Slow spectral sweep (15-second cycle)
    const filterLfo = 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 15);
    
    // Warm harmonic components
    const subBass = Math.sin(2 * Math.PI * 66 * t) * 0.45;
    const voice1 = Math.sin(2 * Math.PI * 132 * t) * 0.3;
    const voice2 = Math.sin(2 * Math.PI * 198 * t) * 0.25 * (0.6 + 0.4 * Math.sin(2 * Math.PI * 0.25 * t));
    const voice3 = Math.sin(2 * Math.PI * 264 * t) * 0.2 * (0.5 + 0.5 * Math.cos(2 * Math.PI * 0.15 * t));
    const solfeggio = Math.sin(2 * Math.PI * 396 * t) * 0.15 * filterLfo;
    
    // Sum and scale
    let sampleVal = (subBass + voice1 + voice2 + voice3 + solfeggio) * breathLfo * 0.4;
    
    // Prevent clipping
    sampleVal = Math.max(-1, Math.min(1, sampleVal));
    
    // Convert float -1.0..1.0 to 8-bit unsigned 0..255 (128 = silence)
    const byteVal = Math.floor((sampleVal + 1.0) * 127.5);
    audioBuffer[i] = byteVal;
  }

  const finalBuffer = Buffer.concat([header, audioBuffer]);
  
  // Write both mp3 and ogg files (containing high-quality PCM for widest native support)
  const mp3Path = path.join(dirPath, 'orbi-zen-ambient.mp3');
  const oggPath = path.join(dirPath, 'orbi-zen-ambient.ogg');
  
  fs.writeFileSync(mp3Path, finalBuffer);
  fs.writeFileSync(oggPath, finalBuffer);
  
  console.log(`Successfully generated premium ambient assets at:`);
  console.log(` - ${mp3Path} (${Math.round(finalBuffer.length / 1024)} KB)`);
  console.log(` - ${oggPath} (${Math.round(finalBuffer.length / 1024)} KB)`);
}

generateAmbientAudio();
