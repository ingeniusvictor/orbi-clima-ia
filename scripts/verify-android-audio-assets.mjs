import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';

const pairs = [
  [
    'public/audio/orbi-zen-ambient.mp3',
    'android/app/src/main/assets/public/audio/orbi-zen-ambient.mp3',
  ],
  [
    'public/audio/orbi-zen-loop-v1.mp3',
    'android/app/src/main/assets/public/audio/orbi-zen-loop-v1.mp3',
  ],
];

const MIN_AUDIO_BYTES = 1_000_000;
const MAX_UTF8_REPLACEMENT_TRIPLETS = 8;
const MIN_MPEG_FRAME_CANDIDATES = 3;

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function countUtf8ReplacementTriplets(bytes) {
  let count = 0;
  for (let i = 0; i <= bytes.length - 3; i += 1) {
    if (bytes[i] === 0xef && bytes[i + 1] === 0xbf && bytes[i + 2] === 0xbd) {
      count += 1;
      i += 2;
    }
  }
  return count;
}

function isPlausibleMpegAudioHeader(bytes, offset) {
  if (offset + 3 >= bytes.length) return false;
  const b0 = bytes[offset];
  const b1 = bytes[offset + 1];
  const b2 = bytes[offset + 2];

  if (b0 !== 0xff || (b1 & 0xe0) !== 0xe0) return false;

  const versionId = (b1 >> 3) & 0x03;
  const layer = (b1 >> 1) & 0x03;
  const bitrateIndex = (b2 >> 4) & 0x0f;
  const sampleRateIndex = (b2 >> 2) & 0x03;

  return (
    versionId !== 0x01 &&
    layer !== 0x00 &&
    bitrateIndex !== 0x00 &&
    bitrateIndex !== 0x0f &&
    sampleRateIndex !== 0x03
  );
}

function countMpegFrameCandidates(bytes) {
  let count = 0;
  for (let i = 0; i < bytes.length - 3; i += 1) {
    if (isPlausibleMpegAudioHeader(bytes, i)) {
      count += 1;
      if (count >= MIN_MPEG_FRAME_CANDIDATES) return count;
    }
  }
  return count;
}

function assertDecodableMp3Shape(path) {
  const bytes = readFileSync(path);
  const startsWithId3 =
    bytes.length >= 3 &&
    bytes[0] === 0x49 &&
    bytes[1] === 0x44 &&
    bytes[2] === 0x33;
  const startsWithFrameSync = isPlausibleMpegAudioHeader(bytes, 0);

  if (!startsWithId3 && !startsWithFrameSync) {
    throw new Error(`${path} does not begin with a recognizable MP3/ID3 signature`);
  }

  const replacementTriplets = countUtf8ReplacementTriplets(bytes);
  if (replacementTriplets > MAX_UTF8_REPLACEMENT_TRIPLETS) {
    throw new Error(
      `${path} contains ${replacementTriplets} UTF-8 replacement triplets (EF BF BD); the binary audio was likely decoded/re-encoded as text`,
    );
  }

  const frameCandidates = countMpegFrameCandidates(bytes);
  if (frameCandidates < MIN_MPEG_FRAME_CANDIDATES) {
    throw new Error(
      `${path} contains only ${frameCandidates} plausible MPEG audio frames; refusing to package an undecodable MP3`,
    );
  }
}

for (const [source, androidCopy] of pairs) {
  if (!existsSync(source)) {
    throw new Error(`Missing source Zen audio: ${source}`);
  }
  if (!existsSync(androidCopy)) {
    throw new Error(
      `Missing Android Zen audio copy: ${androidCopy}. Run the web build and Capacitor copy first.`,
    );
  }

  const sourceSize = statSync(source).size;
  const androidSize = statSync(androidCopy).size;

  if (sourceSize < MIN_AUDIO_BYTES) {
    throw new Error(
      `${source} is unexpectedly small (${sourceSize} bytes); refusing to package a truncated Zen track`,
    );
  }

  assertDecodableMp3Shape(source);
  assertDecodableMp3Shape(androidCopy);

  const sourceHash = sha256(source);
  const androidHash = sha256(androidCopy);

  if (sourceSize !== androidSize || sourceHash !== androidHash) {
    throw new Error(
      [
        `Capacitor audio copy mismatch for ${source}`,
        `source:  ${sourceSize} bytes sha256=${sourceHash}`,
        `android: ${androidSize} bytes sha256=${androidHash}`,
        'The Android APK would not contain the exact source Zen track.',
      ].join('\n'),
    );
  }

  console.log(`PASS ${source} -> ${androidCopy}`);
  console.log(`     ${sourceSize} bytes sha256=${sourceHash}`);
}

console.log('ORBI Zen bundled audio integrity: PASS');
