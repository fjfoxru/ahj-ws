import Chat from './chat';

const chat = new Chat('ws://localhost:7070/ws');
chat.bindInDom();
chat.subscribeToWS();
chat.bindInDomName();