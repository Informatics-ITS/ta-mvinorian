'use client';

import React from 'react';

import { WsMessageType } from '@/app/(_api)/api/ws/route';
import { decrypt, encrypt } from '@/lib/encryption';

export enum WsReadyState {
  UNINITIALIZED = -1,
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

type WsContextType = {
  sendMessage: (message: WsMessageType) => void;
  closeSocket: () => void;
  lastMessage: WsMessageType | null;
  readyState: WsReadyState;
};

const WsContext = React.createContext<WsContextType>({
  sendMessage: () => {},
  closeSocket: () => {},
  lastMessage: null,
  readyState: WsReadyState.CONNECTING,
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
  const [readyState, setReadyState] = React.useState<WsReadyState | null>(null);

  const sendMessage = (message: WsMessageType) => {
    if (!socket) return;
    const { state, data } = message;
    encrypt(data).then((encryptedData) => {
      const messageToSend: WsMessageType = { state, data: encryptedData };
      socket.send(JSON.stringify(messageToSend));
    });
  };

  const closeSocket = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  React.useEffect(() => {
    const ws = new WebSocket(wsUrl);
    setSocket(ws);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as WsMessageType;
      const { state, data } = message;
      if (state === 'players') setMessage(message);
      else
        decrypt(data).then((decryptedData) => {
          const decryptedMessage: WsMessageType = { state, data: decryptedData };
          setMessage(decryptedMessage);
        });
    };

    return () => {
      ws.close();
    };
  }, [wsUrl]);

  React.useEffect(() => {
    if (!socket) return;
    if (!socket.readyState) return;

    setReadyState(socket.readyState);
  }, [socket]);

  return (
    <WsContext.Provider
      value={{ sendMessage, closeSocket, lastMessage: message, readyState: readyState ?? WsReadyState.UNINITIALIZED }}
    >
      {children}
    </WsContext.Provider>
  );
};
