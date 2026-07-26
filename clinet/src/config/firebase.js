import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyForChatApp123456789",
  authDomain: "demo-chat-app.firebaseapp.com",
  databaseURL: "https://demo-chat-app-default-rtdb.firebaseio.com",
  projectId: "demo-chat-app",
  storageBucket: "demo-chat-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:1234567890"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

// Helper for sending messages
export const sendMessageToRoom = async (roomId, senderId, content) => {
  const messageData = {
    content,
    senderId,
    timestamp: Date.now(),
  };

  // 1. Save to localStorage immediately so UI updates without waiting for network
  const storageKey = `chat_messages_${roomId}`;
  const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
  existing.push(messageData);
  localStorage.setItem(storageKey, JSON.stringify(existing));
  
  // Dispatch custom event for same-tab and same-window instant reactivity
  window.dispatchEvent(new Event('chat_storage_update'));

  // 2. Non-blocking push to Firebase
  try {
    const roomRef = ref(database, `messages/${roomId}`);
    push(roomRef, messageData).catch((err) => {
      console.warn("Firebase non-blocking push warning:", err);
    });
  } catch (err) {
    console.warn("Firebase push init error:", err);
  }
};

// Helper for subscribing to room messages
export const subscribeToRoomMessages = (roomId, callback) => {
  const storageKey = `chat_messages_${roomId}`;
  
  const getCombinedMessages = (firebaseVal) => {
    const localMsgs = JSON.parse(localStorage.getItem(storageKey) || '[]');
    let firebaseMsgs = [];
    if (firebaseVal) {
      firebaseMsgs = Object.values(firebaseVal);
    }
    const mergedMap = new Map();
    [...localMsgs, ...firebaseMsgs].forEach(m => {
      if (m && m.content) {
        const key = `${m.senderId}-${m.timestamp}-${m.content}`;
        mergedMap.set(key, m);
      }
    });
    return Array.from(mergedMap.values()).sort((a, b) => a.timestamp - b.timestamp);
  };

  const handleUpdate = (fbVal) => {
    const msgs = getCombinedMessages(fbVal);
    callback(msgs);
  };

  let currentFbVal = null;
  let unsubscribe = () => {};

  try {
    const roomRef = ref(database, `messages/${roomId}`);
    unsubscribe = onValue(roomRef, (snapshot) => {
      currentFbVal = snapshot.val();
      handleUpdate(currentFbVal);
    }, (err) => {
      console.warn("Firebase onValue warning:", err);
      handleUpdate(currentFbVal);
    });
  } catch (err) {
    console.warn("Firebase subscribe warning:", err);
  }

  const onLocalEvent = () => handleUpdate(currentFbVal);
  window.addEventListener('chat_storage_update', onLocalEvent);
  window.addEventListener('storage', onLocalEvent);

  // Initial call with local data
  handleUpdate(null);

  return () => {
    try { unsubscribe(); } catch (e) {}
    window.removeEventListener('chat_storage_update', onLocalEvent);
    window.removeEventListener('storage', onLocalEvent);
  };
};

export { database };
