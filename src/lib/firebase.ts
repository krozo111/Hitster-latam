import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, update, remove, type Database } from 'firebase/database';
import type { GameState, RoomData } from './types';

// ⚠️ IMPORTANTE: Reemplaza estas credenciales con las tuyas de Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDB957j6flnyp2gM_DwhG7_7_CugpKCbsk",
  authDomain: "hitster-latam.firebaseapp.com",
  databaseURL: "https://hitster-latam-default-rtdb.firebaseio.com",
  projectId: "hitster-latam",
  storageBucket: "hitster-latam.firebasestorage.app",
  messagingSenderId: "120450725517",
  appId: "1:120450725517:web:eb3914622f47d01d4f14c4",
  measurementId: "G-Z7NQJEWMC2"
};

let app: ReturnType<typeof initializeApp>;
let db: Database;

export function initFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  }
  return db;
}

export function getDb() {
  if (!db) initFirebase();
  return db;
}

// Room operations
export async function createRoom(roomId: string, state: GameState): Promise<void> {
  const database = getDb();
  const roomRef = ref(database, `rooms/${roomId}`);
  const data: RoomData = {
    state,
    createdAt: Date.now()
  };
  await set(roomRef, data);
}

export async function getRoomState(roomId: string): Promise<GameState | null> {
  const database = getDb();
  const roomRef = ref(database, `rooms/${roomId}/state`);
  const snapshot = await get(roomRef);
  return snapshot.exists() ? snapshot.val() as GameState : null;
}

export function subscribeToRoom(roomId: string, callback: (state: GameState) => void): () => void {
  const database = getDb();
  const stateRef = ref(database, `rooms/${roomId}/state`);
  const unsubscribe = onValue(stateRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as GameState);
    }
  });
  return unsubscribe;
}

export async function updateRoomState(roomId: string, updates: Partial<GameState>): Promise<void> {
  const database = getDb();
  const stateRef = ref(database, `rooms/${roomId}/state`);
  await update(stateRef, updates);
}

export async function setRoomState(roomId: string, state: GameState): Promise<void> {
  const database = getDb();
  const stateRef = ref(database, `rooms/${roomId}/state`);
  await set(stateRef, state);
}

export async function deleteRoom(roomId: string): Promise<void> {
  const database = getDb();
  const roomRef = ref(database, `rooms/${roomId}`);
  await remove(roomRef);
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
