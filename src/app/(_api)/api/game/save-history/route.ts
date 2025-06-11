import { NextRequest } from 'next/server';
import { z } from 'zod';

import { createRequest, withAsyncValidateRequest } from '@/lib/request';
import { createResponseJson } from '@/lib/response';
import { saveGameHistoryService } from '@/service/game-service';

export async function POST(request: NextRequest) {
  const gameSaveHistorySchema = await createRequest(request, ({ t }) => ({
    body: z.object({
      code: z.string().min(1, t('request.code-is-required')),
      round: z.number().int().min(1, t('request.round-is-required')),
      attacker: z.string().nullable(),
      defender: z.string().nullable(),
      gameHistory: z.string().min(1, t('request.game-history-is-required')),
      attackerHistory: z.string().min(1, t('request.attacker-history-is-required')),
      defenderHistory: z.string().min(1, t('request.defender-history-is-required')),
    }),
  }));

  const res = await withAsyncValidateRequest(request, gameSaveHistorySchema, async ({ t, body }) =>
    saveGameHistoryService(t, body),
  );

  if (!res.success) return createResponseJson(400, { success: false, message: res.message, data: res.data });

  return createResponseJson(200, { success: true, message: res.message, data: res.data });
}
