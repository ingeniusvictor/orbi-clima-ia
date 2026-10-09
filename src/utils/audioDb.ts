// IndexedDB helper to store and load custom user-selected audio tracks offline on the device.
const DB_NAME = 'OrbiZenSoundDB';
const DB_VERSION = 1;
const STORE_NAME = 'audio_tracks';
const KEY_NAME = 'custom_user_track';

export interface AudioTrackInfo {
  blob: Blob;
  name: string;
  type: string;
  updatedAt: number;
}

export function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB for Zen Sound');
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function saveCustomAudioTrack(file: File): Promise<void> {
  const db = await openAudioDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const trackData: AudioTrackInfo = {
      blob: file,
      name: file.name,
      type: file.type,
      updatedAt: Date.now()
    };

    const request = store.put(trackData, KEY_NAME);

    request.onsuccess = () => {
      db.close();
      resolve();
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function getCustomAudioTrack(): Promise<AudioTrackInfo | null> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(KEY_NAME);

      request.onsuccess = () => {
        db.close();
        resolve(request.result || null);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error reading custom audio track:', error);
    return null;
  }
}

export async function deleteCustomAudioTrack(): Promise<void> {
  const db = await openAudioDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(KEY_NAME);

    request.onsuccess = () => {
      db.close();
      resolve();
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}
