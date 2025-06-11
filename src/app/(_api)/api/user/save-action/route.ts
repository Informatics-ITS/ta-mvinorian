import { NextRequest } from 'next/server';
import { z } from 'zod';

import { createRequest, withAsyncValidateRequest } from '@/lib/request';
import { createResponseJson } from '@/lib/response';
import { saveUserActionService } from '@/service/user-service';

export async function POST(request: NextRequest) {
  const userSaveActionSchema = await createRequest(request, ({ t }) => ({
    body: z.object({
      userId: z.string().min(1, t('request.user-id-is-required')),
      gameCode: z.string().min(1, t('request.game-code-is-required')),
      role: z.enum(['attacker', 'defender'], { required_error: t('request.role-is-required') }),
      action: z.string().min(1, t('request.action-is-required')),
      target: z.string().optional(),
    }),
  }));

  const res = await withAsyncValidateRequest(request, userSaveActionSchema, async ({ t, body }) =>
    saveUserActionService(t, body),
  );

  if (!res.success) return createResponseJson(400, { success: false, message: res.message, data: res.data });

  return createResponseJson(200, { success: true, message: res.message, data: res.data });
}
