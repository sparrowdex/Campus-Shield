// Usage: node server/scripts/clearUnusedChats.js

const memoryStore = require('../services/memoryStoreSingleton');

memoryStore.chatRooms.clear();
memoryStore.messages.clear();

console.log('All chat rooms and messages have been deleted.'); 