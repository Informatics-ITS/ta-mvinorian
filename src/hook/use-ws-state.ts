import React from 'react';

import { WsMessageType, WsPlayersType } from '@/app/(_api)/api/ws/route';
import { useWsContext } from '@/provider/ws-provider';

export const useWsState = <TData>(stateName: string, defaultData: TData) => {
  const [localState, setLocalState] = React.useState<TData>(defaultData);
  const { sendMessage, lastMessage } = useWsContext();

  const setState = (data: TData) => {
    setLocalState(data);

    const message: WsMessageType = {
      state: stateName,
      data: JSON.stringify(data),
    };

    sendMessage(message);
  };

  React.useEffect(() => {
    const { state, data } = lastMessage ?? {};
    if (!data) return;
    if (state !== stateName) return;

    const parsedData = JSON.parse(data) as TData;
    setLocalState(parsedData);
  }, [lastMessage, stateName]);

  return [localState, setState] as const;
};

export const useWsPlayers = () => {
  const { lastMessage } = useWsContext();

  const [players, setPlayers] = React.useState<WsPlayersType>({ attacker: null, defender: null });

  React.useEffect(() => {
    const { state, data } = lastMessage ?? {};
    if (!data) return;
    if (state !== 'players') return;

    const parsedData = JSON.parse(data) as WsPlayersType;
    setPlayers(parsedData);
  }, [lastMessage]);

  return players;
};
