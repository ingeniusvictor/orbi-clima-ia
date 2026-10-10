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

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function assertMp3Header(path) {
  const bytes = readFileSync(path);
  const startsWithId3 =
    bytes.length >= 3 &&
    bytes[0] === 0x49 &&
    bytes[1] === 0x44 &&
    bytes[2] === 0x33;
  const startsWithFrameSync =
    bytes.length >= 2 &&
    bytes[0] === 0xff &&
    (bytes[1] & 0xe0) === 0xe0;

  if (!startsWithId3 && !startsWithFrameSync) {
    throw new Error(`${path} does not begin with a valid MP3 signature`);
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

  assertMp3Header(source);
  assertMp3Header(androidCopy);

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
