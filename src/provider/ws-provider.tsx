'use client';

import React from 'react';

import { WsMessageType } from '@/app/(_api)/api/ws/route';
import { decrypt, encrypt } from '@/lib/encryption';

type WsContextType = {
  messages: WsMessageType[];
  lastMessage: WsMessageType | null;
  isConnected: boolean;
  onMessage: (callback: (message: WsMessageType) => void) => void;
  sendMessage: (message: WsMessageType) => void;
  closeSocket: () => void;
  clearMessages: () => void;
  removeMessageListener: (callback: (message: WsMessageType) => void) => void;
};

const WsContext = React.createContext<WsContextType>({
  messages: [],
  lastMessage: null,
  isConnected: false,
  onMessage: () => {},
  sendMessage: () => {},
  closeSocket: () => {},
  clearMessages: () => {},
  removeMessageListener: () => {},
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
  maxMessages?: number;
}

export const WsProvider = ({ wsUrl, children, maxMessages = 100 }: WsProviderProps) => {
  const [socket, setSocket] = React.useState<WebSocket | null>(null);
  const [messages, setMessages] = React.useState<WsMessageType[]>([]);
  const [lastMessage, setLastMessage] = React.useState<WsMessageType | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  const messageCallbacksRef = React.useRef<Set<(message: WsMessageType) => void>>(new Set());

  const sendMessage = (message: WsMessageType) => {
    if (!socket) return;
    if (socket.readyState !== WebSocket.OPEN) {
      setTimeout(() => {
        sendMessage(message);
      }, 1000);
      return;
    }

    const { state, data } = message;
    encrypt(data).then((encryptedData) => {
      const messageToSend: WsMessageType = { state, data: encryptedData };
      socket.send(JSON.stringify(messageToSend));
    });
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const onMessage = (callback: (message: WsMessageType) => void) => {
    messageCallbacksRef.current.add(callback);
  };

  const removeMessageListener = (callback: (message: WsMessageType) => void) => {
    messageCallbacksRef.current.delete(callback);
  };

  const closeSocket = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  const processMessage = React.useCallback(
    async (message: WsMessageType) => {
      const { state, data } = message;
      let processMessage: WsMessageType;
      if (state === 'players') {
        processMessage = message;
      } else {
        const decryptedData = await decrypt(data);
        processMessage = { state, data: decryptedData };
      }

      setLastMessage(processMessage);

      setMessages((prev) => {
        const updated = [...prev, processMessage];
        return updated.length > maxMessages ? updated.slice(-maxMessages) : updated;
      });

      messageCallbacksRef.current.forEach((callback) => {
        callback(processMessage);
      });

      return processMessage;
    },
    [maxMessages],
  );

  React.useEffect(() => {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as WsMessageType;
      processMessage(message);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    setSocket(ws);

    const callbacks = messageCallbacksRef.current;

    return () => {
      callbacks.clear();
      ws.close();
    };
  }, [wsUrl, processMessage]);

  return (
    <WsContext.Provider
      value={{
        messages,
        lastMessage,
        isConnected,
        onMessage,
        sendMessage,
        closeSocket,
        clearMessages,
        removeMessageListener,
      }}
    >
      {children}
    </WsContext.Provider>
  );
};
