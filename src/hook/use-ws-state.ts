import React from 'react';

import { WsMessageType, WsPlayersType } from '@/app/(_api)/api/ws/route';
import { useWsContext } from '@/provider/ws-provider';

export const useWsState = <TData>(stateName: string, defaultData: TData) => {
  const [localState, setLocalState] = React.useState<TData>(defaultData);
  const { sendMessage, onMessage, removeMessageListener } = useWsContext();

  const setState = React.useCallback(
    (data: TData) => {
      setLocalState(data);

      const message: WsMessageType = {
        state: stateName,
        data: JSON.stringify(data),
      };

      sendMessage(message);
    },
    [stateName, sendMessage],
  );

  React.useEffect(() => {
    setState(defaultData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const handleMessage = (message: WsMessageType) => {
      const { state, data } = message ?? {};
      if (!data || state !== stateName) return;

      const parsedData = JSON.parse(data) as TData;
      setLocalState(parsedData);
    };

    onMessage(handleMessage);

    return () => removeMessageListener(handleMessage);
  }, [stateName, onMessage, removeMessageListener]);

  return [localState, setState] as const;
};

export const useWsPlayers = () => {
  const [players, setPlayers] = React.useState<WsPlayersType>({ attacker: null, defender: null });
  const { onMessage, removeMessageListener } = useWsContext();

  React.useEffect(() => {
    const handleMessage = (message: WsMessageType) => {
      const { state, data } = message ?? {};
      if (!data || state !== 'players') return;

      const parsedData = JSON.parse(data) as WsPlayersType;
      setPlayers(parsedData);
    };

    onMessage(handleMessage);

    return () => removeMessageListener(handleMessage);
  }, [onMessage, removeMessageListener]);

  return players;
};
