'use client';

import React from 'react';

import { WsMessageType } from '@/app/(_api)/api/ws/route';
import { decrypt, encrypt } from '@/lib/encryption';

type WsContextType = {
  sendMessage: (message: WsMessageType) => void;
  lastMessage: WsMessageType | null;
};

const WsContext = React.createContext<WsContextType>({
  sendMessage: () => {},
  lastMessage: null,
});

export const useWsContext = () => {
  const context = React.useContext(WsContext);
  if (!context) {
    throw new Error('useWsContext must be used within a <WsProvider>');
  }
  return context;
};

export interface WsProviderProps {
  wsUrl: string;
  children: React.ReactNode;
}

export const WsProvider = ({ wsUrl, children }: WsProviderProps) => {
  const [socket, setSocket] = React.useState<WebSocket | null>(null);
  const [message, setMessage] = React.useState<WsMessageType | null>(null);

  const sendMessage = (message: WsMessageType) => {
    if (!socket) return;
    const { state, data } = message;
    encrypt(data).then((encryptedData) => {
      const messageToSend: WsMessageType = { state, data: encryptedData };
      socket.send(JSON.stringify(messageToSend));
    });
  };

  React.useEffect(() => {
    const ws = new WebSocket(wsUrl);
    setSocket(ws);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as WsMessageType;
      const { state, data } = message;
      decrypt(data).then((decryptedData) => {
        const decryptedMessage: WsMessageType = { state, data: decryptedData };
        setMessage(decryptedMessage);
      });
    };

    return () => {
      ws.close();
    };
  }, [wsUrl]);

  return <WsContext.Provider value={{ sendMessage, lastMessage: message }}>{children}</WsContext.Provider>;
};
