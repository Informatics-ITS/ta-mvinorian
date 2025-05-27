import React from 'react';

import { WsMessageType, WsPlayersType } from '@/app/(_api)/api/ws/route';
import { GameRoleType } from '@/provider/game-engine-provider';
import { useWsContext } from '@/provider/ws-provider';

import { useAuthStore } from './use-auth-store';

export const useWsState = <TData>(stateName: string, defaultData: TData) => {
  const [localState, setLocalState] = React.useState<TData>(defaultData);
  const { sendMessage, onMessage, removeMessageListener } = useWsContext();

  const setState = React.useCallback(
    (data: TData | ((prevState: TData) => TData)) => {
      const newData = typeof data === 'function' ? (data as (prevState: TData) => TData)(localState) : data;

      setLocalState(newData);

      const message: WsMessageType = {
        state: stateName,
        data: JSON.stringify(newData),
      };

      sendMessage(message);
    },
    [stateName, sendMessage, localState],
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
  const { user } = useAuthStore();

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

  const isHost = React.useMemo(() => {
    if (!user) return false;
    if (players.attacker) return players.attacker === user.id;
    if (players.defender) return players.defender === user.id;
    return false;
  }, [players, user]);

  const role = React.useMemo<GameRoleType | undefined>(() => {
    if (!user) return undefined;
    if (user.id === players.attacker) return 'attacker';
    if (user.id === players.defender) return 'defender';
    return undefined;
  }, [players, user]);

  return { players, isHost, role };
};
