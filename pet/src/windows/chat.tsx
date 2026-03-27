import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatWindow } from '../components/ChatWindow';
import { initializeAI } from '../renderer/aiInit';

void initializeAI();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ChatWindow />
  </React.StrictMode>
);
